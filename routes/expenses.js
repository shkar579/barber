const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/expenses');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/Addexpense", isAuth, roleAuth, controller.Addexpense);
router.get("/Detailexpense/:id", isAuth, roleAuth, controller.editdetailexpense);
router.put("/Editexpense/:id", isAuth, roleAuth, controller.Updateexpense);
router.post("/Deleteexpense", isAuth, roleAuth, controller.Deleteexpense);
// router.get("/view/:id", isAuth, controller.Viewbarber);
router.get("/expenses", isAuth,roleAuth, async (req, res) => {
    const rows = await db.query(`
        SELECT 
            e.Id, 
            e.Amount,
            DATE_FORMAT(e.Expense_date, '%Y-%m-%d') AS Expense_date, 
            e.Description, 
            c.Category_name
        FROM expenses e
        JOIN expense_categories c ON e.category_Id = c.id
        ORDER BY e.Id DESC
    `);

    const rows2 = await db.query("SELECT * FROM expense_categories");
    res.render("expenses", { data: rows, data2: rows2 });
});

router.get('/Exportexpense', isAuth,roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM expenses');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('expenses');

    // Add Columns
    worksheet.columns = [
        { header: 'ئایدی', key: 'Id', width: 30 },
        { header: 'جۆری خەرجی', key: 'Category_id', width: 30 },
        { header: 'بڕی خەرجی', key: 'Amount', width: 30 },
        { header: 'بەروار', key: 'Expense_date', width: 10 },
        { header: 'تێبینی', key: 'Description', width: 10 },
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
