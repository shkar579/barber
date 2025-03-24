const db = require('../config/db');

class Product {
    static async getAllProducts() {
        const rows = await db.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.date_added DESC
        `);
        return rows;
    }

    static async getProductById(productId) {
        const rows = await db.query(`
            SELECT p.*, c.name AS category_name, 
                   (SELECT SUM(quantity) FROM inventory WHERE product_id = p.id) AS total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.id = ?
        `, [productId]);
        return rows[0];
    }

    static async createProduct(productData) {
        const {
            title,
            cost,
            price,
            description,
            image,
            category_id,
            stock,
            expiry_date,
            popular,
            is_new
        } = productData;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Insert product
            const result = await connection.query(
                `INSERT INTO products 
                (title, cost, price, description, image, category_id, stock, 
                expiry_date, popular, is_new, date_added) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
                [
                    title,
                    cost,
                    price,
                    description,
                    image,
                    category_id,
                    stock,
                    expiry_date,
                    popular,
                    is_new
                ]
            );

            const productId = result.insertId;

            // Add to inventory if stock exists
            if (stock > 0) {
                await connection.query(
                    'INSERT INTO inventory (product_id, quantity) VALUES (?, ?)',
                    [productId, stock]
                );
            }

            await connection.commit();
            return productId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updateProduct(productId, productData) {
        const {
            title,
            cost,
            price,
            description,
            image,
            category_id,
            stock,
            expiry_date,
            popular,
            is_new
        } = productData;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Update product
            await connection.query(
                `UPDATE products 
                SET title = ?, cost = ?, price = ?, description = ?, 
                image = ?, category_id = ?, stock = ?, expiry_date = ?, 
                popular = ?, is_new = ?
                WHERE id = ?`,
                [
                    title,
                    cost,
                    price,
                    description,
                    image,
                    category_id,
                    stock,
                    expiry_date,
                    popular,
                    is_new,
                    productId
                ]
            );

            // Update inventory
            // First, get current inventory quantity
            const inventoryRows = await connection.query(
                'SELECT SUM(quantity) as current_stock FROM inventory WHERE product_id = ?',
                [productId]
            );

            const currentStock = inventoryRows[0].current_stock || 0;

            // Add or subtract from inventory
            if (stock !== currentStock) {
                await connection.query(
                    'INSERT INTO inventory (product_id, quantity, location) VALUES (?, ?, ?)',
                    [productId, stock - currentStock, 'Stock Update']
                );
            }

            await connection.commit();
            return productId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async deleteProduct(productId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Delete inventory records
            await connection.query('DELETE FROM inventory WHERE product_id = ?', [productId]);

            // Delete product
            await connection.query('DELETE FROM products WHERE id = ?', [productId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getCategories() {
        const [rows] = await db.query('SELECT category_id, name FROM categories WHERE is_active = 1');
        return rows;
    }

    static async getProductInventoryHistory(productId) {
        const [rows] = await db.query(`
            SELECT 
                inventory_id, 
                quantity, 
                location, 
                last_updated
            FROM inventory 
            WHERE product_id = ? 
            ORDER BY last_updated DESC
        `, [productId]);
        return rows;
    }

    static async searchProducts(query) {
        const [rows] = await db.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.title LIKE ? OR c.name LIKE ?
        `, [`%${query}%`, `%${query}%`]);
        return rows;
    }
}

module.exports = Product;