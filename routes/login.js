const express = require('express');
const router = express.Router();
const controller = require('../controllers/login');

router.post("/", controller.Postlogin)
router.post("/logout", controller.Postlogin)
router.get("/logout", controller.postLogout)
router.get('/', (req, res) => {
    res.render("login", { message: null });
});

module.exports = router;
