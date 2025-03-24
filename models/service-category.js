const db = require('../config/db');

const serviceCategory = {
    create: async (category) => {
        const { service, price } = category;
        return await db.query('INSERT INTO services (Service,price) VALUES (?, ?)',
            [service, price]);
    },

    getById: async (id, res) => {
        try {
            const rows = await db.query(`
                SELECT Id, Service, Price
                FROM services
                WHERE Id = ?
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
        const { service, price } = category;
        return await db.query('UPDATE services SET Service = ? ,Price = ? WHERE Id = ?',
            [service, price, id]);
    },

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            return await db.query(`DELETE FROM services WHERE Id IN (${placeholders})`, ids);
        }
    }
};

module.exports = serviceCategory;
