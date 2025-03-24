const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Sales report routes
router.get('/sales-report', reportController.getSalesReport);
router.get('/export-sales-csv', reportController.exportSalesCsv);

module.exports = router;