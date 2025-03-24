const db = require('../config/db');

class Inventory {
    // static async getAllInventoryItems() {
    //     const rows = await db.query(`
    //         SELECT 
    //             i.inventory_id, 
    //             i.product_id, 
    //             p.title AS product_name, 
    //             i.quantity, 
    //             i.location, 
    //             i.last_updated 
    //         FROM inventory i
    //         JOIN products p ON i.product_id = p.id
    //         ORDER BY i.last_updated DESC
    //     `);
    //     return rows;
    // }

    static async getAllInventoryItems() {
        const rows = await db.query(`
            SELECT DISTINCT
                i.inventory_id, 
                i.product_id, 
                p.title AS product_name, 
                SUM(i.quantity) AS quantity, 
                GROUP_CONCAT(DISTINCT i.location) AS locations, 
                MAX(i.last_updated) AS last_updated 
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            GROUP BY i.product_id, p.title
            ORDER BY last_updated DESC
        `);
        return rows;
    }

    static async getInventoryItemById(inventoryId) {
        const rows = await db.query(
            'SELECT * FROM inventory WHERE inventory_id = ?',
            [inventoryId]
        );
        return rows[0];
    }

    static async createInventoryItem(productId, quantity, location) {
        const result = await db.query(
            'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
            [productId, quantity, location]
        );
        return result.insertId;
    }

    // static async updateInventoryItem(inventoryId, productId, quantity, location) {
    //     await db.query(
    //         'UPDATE inventory SET product_id = ?, quantity = ?, location = ? WHERE inventory_id = ? && product_id = ?',
    //         [productId, quantity, location, inventoryId]
    //     );
    // }
    static async updateInventoryItem(inventoryId, productId, quantity, location) {
        const result = await db.query(
            'UPDATE inventory SET quantity = ?, location = ? WHERE inventory_id = ? AND product_id = ? AND quantity != ?',
            [quantity, location, inventoryId, productId, quantity]
        );

        if (result.affectedRows === 0) {
            // Either no matching record or quantity was already the same
            return false;
        }

        return true;
    }
    static async deleteInventoryItem(inventoryId) {
        await db.query('DELETE FROM inventory WHERE inventory_id = ?', [inventoryId]);
    }

    static async getProductsList() {
        const rows = await db.query('SELECT id, title FROM products');
        return rows;
    }
}

module.exports = Inventory;

