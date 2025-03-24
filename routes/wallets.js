const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/wallets');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/getWalletByDate", isAuth, roleAuth, controller.getWalletByDate);
router.get("/wallet", isAuth, roleAuth, async (req, res) => {
    const barbers = await db.query("SELECT * FROM barbers");
    res.render("wallet", { barbers, mode: false })
});
module.exports = router;
