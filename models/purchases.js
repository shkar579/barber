const db = require('../config/db');

class Purchase {
    static async findAll() {
        const rows = await db.query(`
            SELECT 
                p.purchase_id, 
                p.purchase_date, 
                p.total_amount, 
                p.payment_method, 
                p.status, 
                p.notes,
                (
                    SELECT GROUP_CONCAT(
                        CONCAT(
                            '{"product_id":', pd.product_id, 
                            ',"product_name":"', REPLACE(pr.title, '"', '\\"'), 
                            '","quantity":', pd.quantity, 
                            ',"cost":', pd.cost, 
                            ',"discount":', IFNULL(pd.discount, 0), 
                            '}'
                        )
                    )
                    FROM purchases_details pd
                    LEFT JOIN products pr ON pd.product_id = pr.id
                    WHERE pd.purchase_id = p.purchase_id
                ) as products
            FROM purchases p
            ORDER BY p.purchase_date DESC
        `);

        // Parse products manually
        return rows.map(row => ({
            ...row,
            products: row.products
                ? JSON.parse(`[${row.products}]`)
                : []
        }));
    }

    static async findById(purchaseId) {
        const purchases = await db.query(`
            SELECT 
                p.purchase_id, 
                p.purchase_date, 
                p.total_amount, 
                p.payment_method, 
                p.status, 
                p.notes,
                (
                    SELECT GROUP_CONCAT(
                        CONCAT(
                            '{"product_id":', pd.product_id, 
                            ',"product_name":"', REPLACE(pr.title, '"', '\\"'), 
                            '","quantity":', pd.quantity, 
                            ',"cost":', pd.cost, 
                            ',"discount":', IFNULL(pd.discount, 0), 
                            '}'
                        )
                    )
                    FROM purchases_details pd
                    LEFT JOIN products pr ON pd.product_id = pr.id
                    WHERE pd.purchase_id = p.purchase_id
                ) as products
            FROM purchases p
            WHERE p.purchase_id = ?
        `, [purchaseId]);

        // Parse purchase
        const purchase = purchases[0];
        if (purchase) {
            purchase.products = purchase.products
                ? JSON.parse(`[${purchase.products}]`)
                : [];
        }
        return purchase;
    }

    static async create(purchaseData, detailsData) {
        // Insert purchase
        const purchaseResult = await db.query(
            'INSERT INTO purchases (total_amount, payment_method, status, notes) VALUES (?, ?, ?, ?)',
            [purchaseData.total_amount, purchaseData.payment_method, purchaseData.status, purchaseData.notes]
        );

        const purchaseId = purchaseResult.insertId;

        // Insert purchase details
        for (let detail of detailsData) {
            await db.query(
                'INSERT INTO purchases_details (purchase_id, product_id, quantity, cost, discount, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
                [purchaseId, detail.product_id, detail.quantity, detail.cost, detail.discount, detail.expiry_date]
            );

            // Update inventory
            await db.query(
                'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                [detail.product_id, detail.quantity, 'Purchase']
            );
        }

        return purchaseId;
    }
    static async update(purchaseId, purchaseData, detailsData) {
        try {
            // Update purchase main details
            await db.query(
                'UPDATE purchases SET total_amount = ?, payment_method = ?, status = ?, notes = ? WHERE purchase_id = ?',
                [purchaseData.total_amount, purchaseData.payment_method, purchaseData.status, purchaseData.notes, purchaseId]
            );

            // Fetch existing purchase details to track inventory changes
            const existingDetails = await db.query(
                'SELECT product_id, quantity FROM purchases_details WHERE purchase_id = ?',
                [purchaseId]
            );

            // Remove existing purchase details
            await db.query('DELETE FROM purchases_details WHERE purchase_id = ?', [purchaseId]);

            // Track inventory changes - revert existing entries
            for (let existingDetail of existingDetails) {
                await db.query(
                    'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                    [existingDetail.product_id, -existingDetail.quantity, 'Purchase Update Reversal']
                );
            }

            // Insert new purchase details and update inventory
            for (let detail of detailsData) {
                // Insert new purchase detail
                await db.query(
                    'INSERT INTO purchases_details (purchase_id, product_id, quantity, cost, discount, expiry_date) VALUES (?, ?, ?, ?, ?, ?)',
                    [purchaseId, detail.product_id, detail.quantity, detail.cost, detail.discount, detail.expiry_date]
                );

                // Update inventory
                await db.query(
                    'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                    [detail.product_id, detail.quantity, 'Purchase Update']
                );
            }

            return purchaseId;
        } catch (error) {
            // Log the error and rethrow
            console.error('Purchase update error:', error);
            throw error;
        }
    }



    static async delete(purchaseId) {
        // Fetch purchase details to adjust inventory
        const purchaseDetails = await db.query(
            'SELECT product_id, quantity FROM purchases_details WHERE purchase_id = ?',
            [purchaseId]
        );

        // Adjust inventory for each product in the purchase
        for (let detail of purchaseDetails) {
            await db.query(
                'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                [detail.product_id, -detail.quantity, 'Purchase Deletion']
            );
        }

        // Delete purchase details
        await db.query('DELETE FROM purchases_details WHERE purchase_id = ?', [purchaseId]);

        // Delete purchase
        await db.query('DELETE FROM purchases WHERE purchase_id = ?', [purchaseId]);

        return true;
    }
}

module.exports = Purchase;