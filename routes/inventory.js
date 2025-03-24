const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventory');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.get('/',isAuth,roleAuth, InventoryController.renderInventoryPage);
router.post('/create',isAuth,roleAuth, InventoryController.createInventoryItem);
router.post('/update',isAuth,roleAuth, InventoryController.updateInventoryItem);
router.post('/delete',isAuth,roleAuth, InventoryController.deleteInventoryItem);

module.exports = router;