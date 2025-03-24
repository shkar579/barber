const express = require('express');
const router = express.Router();
const db = require("../config/db")
const service = require("../models/services")
const barber = require("../models/barbers")
const dashboard = require('../controllers/dashboard');
const isAuth = require("../middleware/is-auth");

// router.get('/', customerController.list);
// router.post('/create', customerController.create);
// router.get('/edit/:id', customerController.getById);
// router.post('/update/:id', customerController.update);
// router.post('/delete/:id', customerController.delete);
router.get('/dashboard', isAuth, async (req, res) => {
    const serv = await service.getAll();
    const barbers = await barber.getAll();

    res.render('dashboard', { allServices: serv, service: [], serviceDetails: [], barbers, editMode: false, });
    // res.render("dashboard", { service, serviceDetails, barbers, allServices });
});

module.exports = router;
