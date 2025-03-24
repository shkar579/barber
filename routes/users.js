const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/users');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/add", isAuth, roleAuth, controller.Adduser);
router.get("/detail/:id", isAuth, roleAuth, controller.editdetailuser);
router.put("/edit/:id", isAuth, roleAuth, controller.Updateuser);
router.post("/delete", isAuth, roleAuth, controller.Deleteuser);
router.get("/view/:id", isAuth, roleAuth, controller.Viewuser);
router.get("/users", isAuth, roleAuth, async (req, res) => {
    const rows = await db.query("SELECT * FROM users");
    res.render("users", { data: rows });
});
router.get('/export', isAuth, roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM users');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('users');

    // Add Columns
    worksheet.columns = [
        { header: 'ناویشان', key: 'Address', width: 30 },
        { header: 'ژمارەی مۆبایل', key: 'Phonenumber', width: 30 },
        { header: 'وشەی نهێنی', key: 'Password', width: 30 },
        { header: 'بەکارهێنەر', key: 'Username', width: 30 },
        { header: 'ناوی دووەم', key: 'Lastname', width: 30 },
        { header: 'ناوی یەکەم', key: 'Firstname', width: 30 },
        { header: 'ئایدی', key: 'Id', width: 10 },
    ];

    // Add Rows
    rows.forEach(row => {
        worksheet.addRow(row);
    });

    // Export File
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=barbers.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

module.exports = router;