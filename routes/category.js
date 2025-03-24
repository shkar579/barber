const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/category');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/Addcategory", isAuth, roleAuth, controller.Addcategory);
router.get("/Detailcategory/:id", isAuth, roleAuth, controller.editdetailcategory);
router.put("/Editcategory/:id", isAuth, roleAuth, controller.Updatecategory);
router.post("/Deletecategory", isAuth, roleAuth, controller.Deletecategory);
// router.get("/view/:id", isAuth, controller.Viewbarber);
router.get("/category", isAuth, roleAuth, async (req, res) => {
    const rows = await db.query(`
        SELECT * FROM categories ORDER BY category_id DESC
    `);
    res.render("category", { data: rows });
});

router.get('/Exportcategory', isAuth, roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM categories');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('categories');

    // Add Columns
    worksheet.columns = [
        { header: 'ئایدی', key: 'category_id', width: 30 },
        { header: 'ناو', key: 'name', width: 30 },
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
