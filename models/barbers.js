const db = require('../config/db');

const Barber = {
    create: async (barber) => {
        const { firstname, lastname, phonenumber, address } = barber;
        return await db.query('INSERT INTO barbers (firstname,lastname,phonenumber,address) VALUES (?, ?, ?, ?)',
            [firstname, lastname, phonenumber, address]);
    },
    getAll: async () => {
        const rows = await db.query("SELECT * FROM barbers");
        return rows;
    },

    getById: async (id, res) => {
        try {
            const rows = await db.query("SELECT * FROM barbers WHERE Id = ?", [id]);

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


    update: async (id, barber) => {
        const { firstname, lastname, phonenumber, address } = barber;
        return await db.query('UPDATE barbers SET Firstname = ?, Lastname = ?, Phonenumber=?, Address = ? WHERE Id = ?',
            [firstname, lastname, phonenumber, address, id]);
    },

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");

            try {
                // Delete from `barber_service_details` first
                await db.query(
                    `DELETE FROM barber_service_details WHERE barber_service_id IN (
                            SELECT id FROM barber_services WHERE barber_id IN (${placeholders})
                        )`,
                    ids
                );

                // Delete from `barber_services` next
                await db.query(
                    `DELETE FROM barber_services WHERE barber_id IN (${placeholders})`,
                    ids
                );

                // Finally, delete from `barbers`
                return await db.query(
                    `DELETE FROM barbers WHERE id IN (${placeholders})`,
                    ids
                );

                console.log("Barbers and related services deleted successfully.");
            } catch (error) {
                console.error("Error deleting data:", error);
            }
        }
        // if (ids && ids.length > 0) {
        // const placeholders = ids.map(() => "?").join(",");
        // return await db.query(`DELETE FROM barbers WHERE id IN (${placeholders})`, ids);
        // }
    }
};

module.exports = Barber;
