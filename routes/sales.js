const express = require('express');
const router = express.Router();
const db = require("../config/db");
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

// Route to get all sales
router.get('/sales', isAuth, async (req, res) => {
    try {
        // SQL query to get all sales with detailed information
        const query = `
            SELECT 
                s.sale_id, 
                s.customer_id, 
                s.sale_date, 
                s.total_amount, 
                s.payment_method, 
                s.status,
                s.notes,
                sd.detail_id,
                sd.quantity,
                sd.unit_price,
                sd.discount,
                sd.subtotal,
                p.title AS product_name,
                p.id AS product_id,
                c.name AS category_name
            FROM 
                sales s
            JOIN 
                sales_details sd ON s.sale_id = sd.sale_id
            JOIN 
                products p ON sd.product_id = p.id
            JOIN 
                categories c ON p.category_id = c.category_id
            ORDER BY 
                s.sale_date DESC
        `;

        // Execute the query using your custom db module
        const rows = await db.query(query);

        // Group sales by sale_id to organize data for the view
        const salesMap = new Map();

        rows.forEach(row => {
            if (!salesMap.has(row.sale_id)) {
                // Create a new sale entry
                salesMap.set(row.sale_id, {
                    sale_id: row.sale_id,
                    customer_id: row.customer_id,
                    sale_date: row.sale_date,
                    total_amount: row.total_amount,
                    payment_method: row.payment_method,
                    status: row.status,
                    notes: row.notes,
                    items: []
                });
            }

            // Add the item to the sale
            salesMap.get(row.sale_id).items.push({
                detail_id: row.detail_id,
                product_id: row.product_id,
                product_name: row.product_name,
                category_name: row.category_name,
                quantity: row.quantity,
                unit_price: row.unit_price,
                discount: row.discount,
                subtotal: row.subtotal
            });
        });

        // Convert map to array for the view
        const sales = Array.from(salesMap.values());

        // Render the EJS template with the sales data
        res.render('sale', {
            sales,
            pageTitle: 'Sales Report',
            path: '/sales'
        });

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).render('404', {
            message: 'Error fetching sales data',
            error: process.env.NODE_ENV === 'development' ? error : {},
            pageTitle: 'Error',
            path: '/error'
        });
    }
});

router.post('/sales/:id/delete', isAuth, roleAuth, async (req, res) => {
    try {
        const saleId = req.params.id;

        // Start a transaction
        await db.query('START TRANSACTION');

        // First, get the sale details to know what products to update
        const getSaleDetailsQuery = `
            SELECT product_id, quantity 
            FROM sales_details
            WHERE sale_id = ?
        `;
        const saleDetails = await db.query(getSaleDetailsQuery, [saleId]);

        // Insert new inventory records for each product in the deleted sale
        for (const item of saleDetails) {
            const inventoryQuery = `
                INSERT INTO inventory (product_id, quantity, location, last_updated)
                VALUES (?, ?, 'Sales delete return', CURRENT_TIMESTAMP)
            `;
            await db.query(inventoryQuery, [item.product_id, item.quantity]);
        }

        // Delete the associated sale details
        const deleteSaleDetailsQuery = `
            DELETE FROM sales_details 
            WHERE sale_id = ?
        `;
        await db.query(deleteSaleDetailsQuery, [saleId]);

        // Then delete the sale record
        const deleteSaleQuery = `
            DELETE FROM sales 
            WHERE sale_id = ?
        `;
        await db.query(deleteSaleQuery, [saleId]);

        // Commit the transaction
        await db.query('COMMIT');

        // Redirect to sales list
        res.redirect('/admin/sales');

    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');

        console.error('Error deleting sale:', error);
        res.status(500).render('404', {
            message: 'Error deleting sale',
            error: process.env.NODE_ENV === 'development' ? error : {},
            pageTitle: 'Error',
            path: '/error'
        });
    }
});

// Route to export sales data to Excel
router.get('/sales/export', isAuth, roleAuth, async (req, res) => {
    try {
        // SQL query to get all sales with detailed information
        const query = `
            SELECT 
                s.sale_id, 
                s.customer_id, 
                s.sale_date, 
                s.total_amount, 
                s.payment_method, 
                s.status,
                s.notes,
                sd.detail_id,
                sd.quantity,
                sd.unit_price,
                sd.discount,
                sd.subtotal,
                p.title AS product_name,
                p.id AS product_id,
                c.name AS category_name
            FROM 
                sales s
            JOIN 
                sales_details sd ON s.sale_id = sd.sale_id
            JOIN 
                products p ON sd.product_id = p.id
            JOIN 
                categories c ON p.category_id = c.category_id
            ORDER BY 
                s.sale_date DESC
        `;

        const rows = await db.query(query);

        // Initialize Excel workbook
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define columns
        worksheet.columns = [
            { header: 'Sale ID', key: 'sale_id', width: 10 },
            { header: 'Date', key: 'sale_date', width: 20 },
            { header: 'Customer ID', key: 'customer_id', width: 15 },
            { header: 'Product', key: 'product_name', width: 30 },
            { header: 'Category', key: 'category_name', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Unit Price', key: 'unit_price', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Subtotal', key: 'subtotal', width: 15 },
            { header: 'Payment Method', key: 'payment_method', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data rows
        rows.forEach(row => {
            worksheet.addRow({
                sale_id: row.sale_id,
                sale_date: new Date(row.sale_date).toLocaleString(),
                customer_id: row.customer_id,
                product_name: row.product_name,
                category_name: row.category_name,
                quantity: row.quantity,
                unit_price: row.unit_price,
                discount: row.discount,
                subtotal: row.subtotal,
                payment_method: row.payment_method,
                status: row.status
            });
        });

        // Set response headers for file download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=sales_report.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting sales data:', error);
        res.status(500).json({
            error: 'Failed to export sales data',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

router.get('/sales/:id/edit', isAuth, async (req, res) => {
    try {
        const saleId = req.params.id;

        // Query to get sale details
        const saleQuery = `
            SELECT * FROM sales WHERE sale_id = ?
        `;

        // Query to get sale items
        const itemsQuery = `
            SELECT 
                sd.*,
                p.title AS product_name,
                p.id AS product_id,
                c.name AS category_name,
                c.category_id
            FROM 
                sales_details sd
            JOIN 
                products p ON sd.product_id = p.id
            JOIN 
                categories c ON p.category_id = c.category_id
            WHERE 
                sd.sale_id = ?
        `;

        // Query to get all products for the product selection dropdown
        const productsQuery = `
            SELECT 
                p.id, 
                p.title, 
                p.price, 
                c.category_id, 
                c.name AS category_name,
                i.quantity AS available_quantity
            FROM 
                products p
            JOIN 
                categories c ON p.category_id = c.category_id
            LEFT JOIN
                inventory i ON p.id = i.product_id
            ORDER BY 
                p.title
        `;

        // Execute queries
        const saleRows = await db.query(saleQuery, [saleId]);
        const itemRows = await db.query(itemsQuery, [saleId]);
        const products = await db.query(productsQuery);

        if (saleRows.length === 0) {
            return res.status(404).render('404', {
                message: 'Sale not found',
                error: {},
                pageTitle: 'Error',
                path: '/error'
            });
        }

        const sale = {
            ...saleRows[0],
            items: itemRows
        };

        res.render('sale-edit', {
            sale,
            products,
            pageTitle: `Edit Sale #${saleId}`,
            path: '/sales'
        });

    } catch (error) {
        console.error('Error fetching sale for edit:', error);
        res.status(500).render('404', {
            message: 'Error fetching sale details for edit',
            error: process.env.NODE_ENV === 'development' ? error : {},
            pageTitle: 'Error',
            path: '/error'
        });
    }
});
router.post('/sales/:id/update', isAuth, async (req, res) => {
    try {
        const saleId = req.params.id;
        const {
            customer_id,
            payment_method,
            status,
            notes,
            items,
            product_ids,
            quantities,
            unit_prices,
            discounts
        } = req.body;

        // Start a transaction
        await db.query('START TRANSACTION');

        // First, get the current sale details to compare with new values
        const currentSaleDetailsQuery = `
            SELECT product_id, quantity 
            FROM sales_details 
            WHERE sale_id = ?
        `;
        const currentSaleDetails = await db.query(currentSaleDetailsQuery, [saleId]);

        // Create a map for easy lookup of current quantities
        const currentItemsMap = new Map();
        currentSaleDetails.forEach(item => {
            currentItemsMap.set(item.product_id, item.quantity);
        });

        // Prepare new products data
        const productIdArray = Array.isArray(product_ids) ? product_ids : [product_ids];
        const quantityArray = Array.isArray(quantities) ? quantities : [quantities];
        const unitPriceArray = Array.isArray(unit_prices) ? unit_prices : [unit_prices];
        const discountArray = Array.isArray(discounts) ? discounts : [discounts];

        // Verify inventory availability for new quantities
        let inventoryError = false;
        let errorMessage = '';

        // Get current inventory levels for all products
        const productIds = productIdArray.map(id => parseInt(id, 10));
        const inventoryQuery = `
            SELECT product_id, SUM(quantity) as available_quantity
            FROM inventory
            WHERE product_id IN (?)
            GROUP BY product_id
        `;
        const inventoryData = await db.query(inventoryQuery, [productIds]);

        // Create a map of current inventory levels
        const inventoryMap = new Map();
        inventoryData.forEach(item => {
            inventoryMap.set(item.product_id, item.available_quantity);
        });

        // Check inventory for each product in the update
        for (let i = 0; i < productIdArray.length; i++) {
            const productId = parseInt(productIdArray[i], 10);
            const newQuantity = parseInt(quantityArray[i], 10);
            const currentQuantity = currentItemsMap.get(productId) || 0;
            const quantityDifference = newQuantity - currentQuantity;

            // Only check if we're increasing the quantity
            if (quantityDifference > 0) {
                const availableQuantity = inventoryMap.get(productId) || 0;

                // If trying to increase quantity more than what's available
                if (quantityDifference > availableQuantity) {
                    inventoryError = true;
                    // Get product name for better error message
                    const productNameQuery = `SELECT title FROM products WHERE id = ?`;
                    const productData = await db.query(productNameQuery, [productId]);
                    const productName = productData.length > 0 ? productData[0].title : `Product #${productId}`;

                    errorMessage = `Not enough inventory for ${productName}. Requested increase: ${quantityDifference}, Available: ${availableQuantity}`;
                    break;
                }
            }
        }

        if (inventoryError) {
            await db.query('ROLLBACK');

            // Instead of rendering an error page, redirect back to edit page with error message
            req.session.flashError = errorMessage;
            return res.redirect(`/admin/sales/${saleId}/edit`);
        }

        // Update the main sale record
        const updateSaleQuery = `
            UPDATE sales 
            SET 
                customer_id = ?,
                payment_method = ?,
                status = ?,
                notes = ?
            WHERE 
                sale_id = ?
        `;

        await db.query(updateSaleQuery, [
            customer_id,
            payment_method,
            status,
            notes,
            saleId
        ]);

        // Create a set of new product IDs for fast lookups
        const newProductIds = new Set(productIdArray.map(id => parseInt(id, 10)));

        // Handle removed products first - return their quantities to inventory
        for (const [productId, quantity] of currentItemsMap.entries()) {
            // If a product that was in the original sale is not in the updated sale
            if (!newProductIds.has(productId)) {
                // Add the quantity back to inventory (positive adjustment)
                const inventoryUpdateQuery = `
                    INSERT INTO inventory (product_id, quantity, location, last_updated)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `;

                await db.query(inventoryUpdateQuery, [
                    productId,
                    quantity, // Add the full quantity back
                    'Sales update return - item removed'
                ]);
            }
        }

        // Delete all existing sale details - we'll recreate them
        const deleteSaleDetailsQuery = `
            DELETE FROM sales_details 
            WHERE sale_id = ?
        `;

        await db.query(deleteSaleDetailsQuery, [saleId]);

        // Add new sale details and update inventory
        let totalAmount = 0;

        for (let i = 0; i < productIdArray.length; i++) {
            const productId = parseInt(productIdArray[i], 10);
            const quantity = parseInt(quantityArray[i], 10);
            const unitPrice = parseFloat(unitPriceArray[i]);
            const discount = parseFloat(discountArray[i] || 0);

            // Calculate subtotal with flat discount
            // Note: Here we're applying discount as a flat amount, not per unit
            const subtotal = (unitPrice * quantity) - discount;

            // Insert sale detail
            const insertDetailQuery = `
                INSERT INTO sales_details 
                (sale_id, product_id, quantity, unit_price, discount, subtotal) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await db.query(insertDetailQuery, [
                saleId,
                productId,
                quantity,
                unitPrice,
                discount,
                subtotal
            ]);

            // Calculate the inventory adjustment needed
            const previousQuantity = currentItemsMap.get(productId) || 0;
            const quantityDifference = quantity - previousQuantity;

            // Only update inventory if there's a change in quantity
            if (quantityDifference !== 0) {
                // Instead of updating existing records, insert a new inventory record
                const inventoryUpdateQuery = `
                    INSERT INTO inventory (product_id, quantity, location, last_updated)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `;

                const location = quantityDifference > 0
                    ? 'Sales update deduction'
                    : 'Sales update return';

                // We use negative of quantityDifference because:
                // If we're increasing the sale quantity, we need to decrease inventory (negative value)
                // If we're decreasing the sale quantity, we need to increase inventory (positive value)
                await db.query(inventoryUpdateQuery, [
                    productId,
                    -quantityDifference,
                    location
                ]);
            }

            totalAmount += subtotal;
        }

        // Update the total amount in the sale record
        const updateTotalQuery = `
            UPDATE sales 
            SET total_amount = ? 
            WHERE sale_id = ?
        `;

        await db.query(updateTotalQuery, [totalAmount, saleId]);

        // Add success message
        req.session.flashSuccess = "Sale updated successfully";

        // Commit the transaction
        await db.query('COMMIT');

        // Redirect to sale details
        res.redirect(`/admin/sales/`);

    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');

        console.error('Error updating sale:', error);
        req.session.flashError = "An error occurred while updating the sale.";
        res.redirect(`/admin/sales/${req.params.id}/edit`);
    }
});

module.exports = router;