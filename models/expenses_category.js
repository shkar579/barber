const db = require('../config/db');

const Expense_category = {
    create: async (expense_category) => {
        const { category_name } = expense_category;
        return await db.query('INSERT INTO Expense_categories (Category_name) VALUES (?)',
            [category_name]);
    },
    getAll: async () => {
        const rows = await db.query("SELECT * FROM Expense_catgories");
        return rows;
    },

    // getById: async (id, res) => {
    //     try {
    //         const rows = await db.query("SELECT * FROM barbers WHERE Id = ?", [id]);

    //         if (rows.length > 0) {
    //             res.status(200).json(rows[0]); // Return the first row as JSON
    //         } else {
    //             res.status(404).send({ success: false, message: "Row not found" });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).send({ success: false, message: "Failed to fetch row details" });
    //     }
    // },


    // update: async (id, barber) => {
    //     const { firstname, lastname,phonenumber, address } = barber;
    //     return await db.query('UPDATE barbers SET Firstname = ?, Lastname = ?, Phonenumber=?, Address = ? WHERE Id = ?',
    //         [firstname, lastname, phonenumber, address, id]);
    // },

    // delete: async (ids) => {
    //     if (ids && ids.length > 0) {
    //         const placeholders = ids.map(() => "?").join(",");
    //         return await db.query(`DELETE FROM barbers WHERE id IN (${placeholders})`, ids);
    //     }
    // }
};

module.exports = Expense_category;
