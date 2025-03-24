const db = require('../config/db');

const Expense = {
    create: async (expense) => {
        const { category, amount, expense_date, description } = expense;
        return await db.query('INSERT INTO expenses (Category_id,amount,Expense_date,Description) VALUES (?, ?, ?, ?)',
            [category, amount, expense_date, description]);
    },
    // getAll: async () => {
    //     const rows = await db.query("SELECT * FROM barbers");
    //     return rows;
    // },

    getById: async (id, res) => {
        try {
            const rows = await db.query(`
                SELECT Id, Category_id, Amount, DATE_FORMAT(Expense_date, '%Y-%m-%d') AS Expense_date, Description
                FROM expenses
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


    update: async (id, barber) => {
        const { category, amount, expense_date, description } = barber;
        return await db.query('UPDATE expenses SET Category_id = ?, Amount = ?, Expense_date=?, Description = ? WHERE Id = ?',
            [category, amount, expense_date, description, id]);
    },

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            return await db.query(`DELETE FROM expenses WHERE Id IN (${placeholders})`, ids);
        }
    }
};

module.exports = Expense;
