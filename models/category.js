const db = require('../config/db');

const Category = {
    create: async (category) => {
        const { name, description } = category;
        return await db.query('INSERT INTO categories (name,description) VALUES (?, ?)',
            [name, description]);
    },

    getById: async (id, res) => {
        try {
            const rows = await db.query(`
                SELECT category_id, name
                FROM categories
                WHERE category_id = ?
            `, [id]);

            if (rows.length > 0) {
                res.status(200).json(rows[0]); // Return the first row as JSON
            } else {
                res.status(404).send({ success: false, message: "Row not found" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, message: "Failed to fetch row details" });
        }
    },


    update: async (id, category) => {
        const { name } = category;
        return await db.query('UPDATE categories SET name = ? WHERE category_id = ?',
            [name, id]);
    },

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            await db.query(`DELETE FROM products WHERE category_id IN (${placeholders})`, ids);

            return await db.query(`DELETE FROM categories WHERE category_id IN (${placeholders})`, ids);
        }
    }
};

module.exports = Category;
