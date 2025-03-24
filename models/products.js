const db = require('../config/db');

const Products = {
    create: async (product) => {
        try {
            // Validate that we have a product object
            if (!product) {
                throw new Error('Product data is missing');
            }

            const { title, cost, price, description, image, category_id, stock, expiry_date, popular, is_new, date_added } = product;

            // Set default values for optional fields
            const productData = [
                title,
                cost || 0,
                price || 0,
                description || null,
                image || null,
                category_id,
                stock || 0,
                expiry_date || null,
                popular || 0,
                is_new || 0,
                date_added || new Date().toISOString().split('T')[0]
            ];


            const result = await db.query(
                'INSERT INTO products (title,cost, price, description, image, category_id, stock, expiry_date, popular, is_new, date_added) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?)',
                productData
            );

            return result;
        } catch (error) {
            console.error("Error in Products.create:", error);
            throw error;
        }
    },


    getById: async (id, res) => {
        try {
            const rows = await db.query(`
                SELECT p.id, p.title, p.cost, p.price, p.description, p.image, p.category_id, 
                       c.name AS category_name, p.stock, 
                       DATE_FORMAT(p.expiry_date, '%Y-%m-%d') AS expiry_date, 
                       p.popular, p.is_new, 
                       DATE_FORMAT(p.date_added, '%Y-%m-%d') AS date_added
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.id = ?
            `, [id]);

            if (rows.length > 0) {
                res.status(200).json(rows[0]); // Return the first row as JSON
            } else {
                res.status(404).send({ success: false, message: "Product not found" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, message: "Failed to fetch product details" });
        }
    },

    update: async (id, product) => {
        try {
            // Validate that we have a product object and ID
            if (!product) {
                throw new Error('Product data is missing');
            }

            if (!id) {
                throw new Error('Product ID is missing');
            }

            const { title, cost, price, description, image, category_id, stock, expiry_date, popular, is_new, date_added } = product;


            // Different query depends on whether image is provided
            let query, params;

            if (image) {
                query = `
                    UPDATE products 
                    SET title = ?, 
                        cost = ?, 
                        price = ?, 
                        description = ?, 
                        image = ?, 
                        category_id = ?, 
                        stock = ?, 
                        expiry_date = ?, 
                        popular = ?, 
                        is_new = ?, 
                        date_added = ? 
                    WHERE id = ?
                `;
                params = [
                    title,
                    cost,
                    price,
                    description || null,
                    image,
                    category_id,
                    stock || 0,
                    expiry_date || null,
                    popular || 0,
                    is_new || 0,
                    date_added || new Date().toISOString().split('T')[0],
                    id
                ];
            } else {
                query = `
                    UPDATE products 
                    SET title = ?, 
                        cost = ?, 
                        price = ?, 
                        description = ?, 
                        category_id = ?, 
                        stock = ?, 
                        expiry_date = ?, 
                        popular = ?, 
                        is_new = ?, 
                        date_added = ? 
                    WHERE id = ?
                `;
                params = [
                    title,
                    cost,
                    price,
                    description || null,
                    category_id,
                    stock || 0,
                    expiry_date || null,
                    popular || 0,
                    is_new || 0,
                    date_added || new Date().toISOString().split('T')[0],
                    id
                ];
            }

            const result = await db.query(query, params);
            return result;
        } catch (error) {
            console.error("Error in Products.update:", error);
            throw error;
        }
    },

    // delete: async (ids) => {
    //     if (ids && ids.length > 0) {
    //         try {
    //             // Create placeholders for the SQL query
    //             const placeholders = ids.map(() => "?").join(",");

    //             // Delete related inventory records first (if they exist)
    //             try {
    //                 await db.query(
    //                     `DELETE FROM inventory WHERE product_id IN (${placeholders})`,
    //                     ids
    //                 );
    //             } catch (error) {
    //                 console.log("No inventory records or inventory table doesn't exist, continuing with product deletion");
    //             }

    //             // Then delete the products
    //             await db.query(
    //                 `DELETE FROM products WHERE id IN (${placeholders})`,
    //                 ids
    //             );

    //             return { success: true };
    //         } catch (error) {
    //             console.error("Delete operation failed:", error);
    //             throw error;
    //         }
    //     }
    //     return { success: false, message: "No product IDs provided" };
    // }

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            try {
                // Begin transaction for safety
                await db.query('START TRANSACTION');

                // Create placeholders for the SQL query
                const placeholders = ids.map(() => "?").join(",");

                // First delete records from sales_details table
                try {
                    await db.query(
                        `DELETE FROM sales_details WHERE product_id IN (${placeholders})`,
                        ids
                    );
                    console.log("Related sales_details records deleted");
                } catch (error) {
                    console.log("Error deleting sales_details:", error);
                    await db.query('ROLLBACK');
                    throw error;
                }

                // Then delete records from purchases_details table
                try {
                    await db.query(
                        `DELETE FROM purchases_details WHERE product_id IN (${placeholders})`,
                        ids
                    );
                    console.log("Related purchases_details records deleted");
                } catch (error) {
                    console.log("Error deleting purchases_details:", error);
                    await db.query('ROLLBACK');
                    throw error;
                }

                // Delete inventory records
                try {
                    await db.query(
                        `DELETE FROM inventory WHERE product_id IN (${placeholders})`,
                        ids
                    );
                    console.log("Related inventory records deleted");
                } catch (error) {
                    console.log("Error deleting inventory:", error);
                    await db.query('ROLLBACK');
                    throw error;
                }

                // Finally delete the products
                await db.query(
                    `DELETE FROM products WHERE id IN (${placeholders})`,
                    ids
                );

                // Commit the transaction
                await db.query('COMMIT');

                return { success: true };
            } catch (error) {
                // Rollback on any error
                await db.query('ROLLBACK');
                console.error("Delete operation failed:", error);
                throw error;
            }
        }
        return { success: false, message: "No product IDs provided" };
    }
};

module.exports = Products;