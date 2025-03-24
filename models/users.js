const db = require('../config/db');

const Users = {
    create: async (req) => {
        // Validate phone number
        const { firstname, lastname, username, password, phonenumber, userrole } = req;
        // if (!/^\d{10,15}$/.test(phonenumber)) {
        //     return res.status(400).send("Invalid phone number format");
        // }
        return await db.query('INSERT INTO users (Firstname,Lastname, Username,Password, Phonenumber, User_role) VALUES (?, ?, ?, ?,?,?)',
            [firstname, lastname, username, password, phonenumber, userrole]);
    },

    getAll: async () => {
        const rows = await db.query("SELECT * FROM users");
        return rows;
    },

    getById: async (id, res) => {
        try {
            const rows = await db.query("SELECT * FROM users WHERE Id = ?", [id]);

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


    update: async (id, user) => {
        const { firstname, lastname, username, password, phonenumber, userrole } = user;
        return await db.query('UPDATE users SET Firstname = ?, Lastname = ?, Username = ?, Password=?, Phonenumber=?, User_role = ? WHERE Id = ?',
            [firstname, lastname, username, password, phonenumber, userrole, id]);
    },

    delete: async (ids) => {
        if (ids && ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            return await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
        }
    }
};

module.exports = Users;
