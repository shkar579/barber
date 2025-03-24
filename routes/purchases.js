const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchases');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.get('/', isAuth, roleAuth, purchasesController.listPurchases);
router.get('/create', isAuth, roleAuth, purchasesController.showCreateForm);
router.post('/create', isAuth, roleAuth, purchasesController.createPurchase);
router.get('/edit/:id', isAuth, roleAuth, purchasesController.showEditForm);
router.post('/edit/:id', isAuth, roleAuth, purchasesController.updatePurchase);
router.get('/delete/:id', isAuth, roleAuth, purchasesController.deletePurchase);

module.exports = router;