const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/expense_category');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");

router.post("/Addexpense_category", isAuth, controller.Addexpense_category);
// router.get("/Detailbarber/:id", isAuth, controller.editdetailbarber);
// router.put("/Editbarber/:id", isAuth, controller.Updatebarber);
// router.post("/Deletebarber", isAuth, controller.Deletebarber);
// router.get("/view/:id", isAuth, controller.Viewbarber);
router.get("/expenses_category", isAuth, async (req, res) => {
    try {
        const categories = await db.query("SELECT Id, Category_name FROM Expense_categories ORDER BY Category_name ASC");
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

module.exports = router;
