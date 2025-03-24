const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/service-category');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/AddServiceCategory", isAuth, roleAuth, controller.Addcategory);
router.get("/DetailServiceCategory/:id", isAuth, roleAuth, controller.editdetailcategory);
router.put("/EditServiceCategory/:id", isAuth, roleAuth, controller.Updatecategory);
router.post("/DeleteServiceCategory", isAuth, roleAuth, controller.Deletecategory);
// router.get("/view/:id", isAuth, controller.Viewbarber);
router.get("/serviceCategory", isAuth, roleAuth, async (req, res) => {
    const rows = await db.query(`
        SELECT * FROM services ORDER BY Id DESC
    `);
    res.render("service-category", { data: rows });
});

router.get('/ExportserviceCategory', isAuth, roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM services');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('services');

    // Add Columns
    worksheet.columns = [
        { header: 'ئایدی', key: 'Id', width: 30 },
        { header: 'خزمەتگوزاری', key: 'Service', width: 30 },
        { header: 'نرخ', key: 'Price', width: 30 },
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
