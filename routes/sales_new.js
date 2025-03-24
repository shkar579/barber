const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales');

// Sales list
router.get('/', salesController.index);

// Create sale
router.get('/create', salesController.create);
router.post('/', salesController.store);

// View sale
router.get('/:id', salesController.view);

// Edit sale
router.get('/:id/edit', salesController.edit);
router.put('/:id', salesController.update);

// Delete sale
router.delete('/:id', salesController.delete);

module.exports = router;