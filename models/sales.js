const db = require('../config/db');
class SalesModel {
    // Get all sales with product details
    static async getAllSales() {
        const sales = await db.query(`
            SELECT 
                s.sale_id, 
                s.sale_date, 
                s.total_amount, 
                s.payment_method,
                s.status,
                GROUP_CONCAT(
                    CONCAT(p.title, ' (', sd.quantity, ' x ', sd.unit_price, ')') 
                    SEPARATOR ', '
                ) AS products
            FROM sales s
            JOIN sales_details sd ON s.sale_id = sd.sale_id
            JOIN products p ON sd.product_id = p.id
            GROUP BY s.sale_id
            ORDER BY s.sale_date DESC
        `);
        return sales;
    }

    // Get sale by ID with details
    static async getSaleById(saleId) {
        const [sale] = await db.query(`
            SELECT 
                s.sale_id, 
                s.sale_date, 
                s.total_amount, 
                s.payment_method,
                s.status,
                s.notes
            FROM sales s
            WHERE s.sale_id = ?
        `, [saleId]);

        const [details] = await db.query(`
            SELECT 
                sd.detail_id,
                p.title,
                sd.product_id,
                sd.quantity,
                sd.unit_price,
                sd.discount
            FROM sales_details sd
            JOIN products p ON sd.product_id = p.id
            WHERE sd.sale_id = ?
        `, [saleId]);

        return { 
            sale: sale[0], 
            details 
        };
    }

    // Create new sale
    static async createSale(saleData, saleDetails) {
        const connection = await db.getConnection();

        try {
            // Start transaction
            await connection.beginTransaction();

            // Insert sale
            const saleResult = await connection.query(
                'INSERT INTO sales (total_amount, payment_method, status, notes) VALUES (?, ?, ?, ?)',
                [saleData.total_amount, saleData.payment_method, saleData.status, saleData.notes]
            );

            const saleId = saleResult.insertId;

            // Insert sale details and update inventory
            for (let item of saleDetails) {
                // Insert sale detail
                await connection.query(
                    'INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, discount) VALUES (?, ?, ?, ?, ?)',
                    [saleId, item.product_id, item.quantity, item.unit_price, item.discount || 0]
                );

                // Update inventory
                await connection.query(
                    'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                    [item.product_id, -item.quantity, 'Sales deduction']
                );
            }

            // Commit transaction
            await connection.commit();

            return saleId;
        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update sale
    static async updateSale(saleId, saleData, saleDetails) {
        const connection = await db.getConnection();

        try {
            // Start transaction
            await connection.beginTransaction();

            // Update sale
            await connection.query(
                'UPDATE sales SET total_amount = ?, payment_method = ?, status = ?, notes = ? WHERE sale_id = ?',
                [saleData.total_amount, saleData.payment_method, saleData.status, saleData.notes, saleId]
            );

            // Delete existing sale details
            await connection.query('DELETE FROM sales_details WHERE sale_id = ?', [saleId]);

            // Revert previous inventory changes
            await connection.query(
                'INSERT INTO inventory (product_id, quantity, location) SELECT product_id, quantity, "Sales update return" FROM sales_details WHERE sale_id = ?', 
                [saleId]
            );

            // Insert new sale details and update inventory
            for (let item of saleDetails) {
                // Insert sale detail
                await connection.query(
                    'INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, discount) VALUES (?, ?, ?, ?, ?)',
                    [saleId, item.product_id, item.quantity, item.unit_price, item.discount || 0]
                );

                // Update inventory
                await connection.query(
                    'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                    [item.product_id, -item.quantity, 'Sales update deduction']
                );
            }

            // Commit transaction
            await connection.commit();

            return saleId;
        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Delete sale
    static async deleteSale(saleId) {
        const connection = await db.getConnection();

        try {
            // Start transaction
            await connection.beginTransaction();

            // Return products to inventory
            await connection.query(
                'INSERT INTO inventory (product_id, quantity, location) SELECT product_id, quantity, "Sales delete return" FROM sales_details WHERE sale_id = ?', 
                [saleId]
            );

            // Delete sale details
            await connection.query('DELETE FROM sales_details WHERE sale_id = ?', [saleId]);

            // Delete sale
            await connection.query('DELETE FROM sales WHERE sale_id = ?', [saleId]);

            // Commit transaction
            await connection.commit();

            return true;
        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get products for sale creation/editing
    static async getProductsForSale() {
        const [products] = await db.query(`
            SELECT id, title, price, stock 
            FROM products 
            WHERE stock > 0
        `);
        return products;
    }
}

module.exports = SalesModel;