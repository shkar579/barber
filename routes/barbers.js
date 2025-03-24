const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/barbers');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/Addbarber", isAuth, roleAuth, controller.Addbarber);
router.get("/Detailbarber/:id", isAuth, roleAuth, controller.editdetailbarber);
router.put("/Editbarber/:id", isAuth, roleAuth, controller.Updatebarber);
router.post("/Deletebarber", isAuth, controller.Deletebarber);
router.get("/view/:id", isAuth, roleAuth, controller.Viewbarber);
router.get("/barbers", isAuth, roleAuth, async (req, res) => {
    const rows = await db.query("SELECT * FROM barbers");
    res.render("barbers", { data: rows });
});
router.get('/Exportbarber', isAuth, roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM barbers');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('barbers');

    // Add Columns
    worksheet.columns = [
        { header: 'ناویشان', key: 'Address', width: 30 },
        { header: 'ژمارەی مۆبایل', key: 'Phonenumber', width: 30 },
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
