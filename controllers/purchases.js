const Purchase = require('../models/purchases');
const db = require('../config/db');

exports.listPurchases = async (req, res) => {
    try {
        const products = await db.query('SELECT * FROM products');
        const purchases = await Purchase.findAll();
        res.render('purchases/list', { purchases, products });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.showCreateForm = async (req, res) => {
    try {
        const products = await db.query('SELECT * FROM products');
        res.render('purchases/create', { products });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.createPurchase = async (req, res) => {
    try {
        const { total_amount, payment_method, status, notes, products } = req.body;

        const purchaseData = {
            total_amount,
            payment_method,
            status,
            notes
        };

        const detailsData = products.map(product => ({
            product_id: product.id,
            quantity: product.quantity,
            cost: product.cost,
            discount: product.discount || 0, // Now a flat amount
            expiry_date: product.expiry_date
        }));

        const purchaseId = await Purchase.create(purchaseData, detailsData);
        res.redirect('/purchases');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.showEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await db.query('SELECT * FROM products');
        const purchase = await Purchase.findById(id);
        res.render('purchases/edit', { purchase, products });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { total_amount, payment_method, status, notes, products } = req.body;
        
        const purchaseData = {
            total_amount,
            payment_method,
            status,
            notes
        };
        
        const detailsData = products.map(product => ({
            product_id: product.id,
            quantity: product.quantity,
            cost: product.cost,
            discount: product.discount || 0, // Now this is a flat amount
            expiry_date: product.expiry_date
        }));
        
        await Purchase.update(id, purchaseData, detailsData);
        res.redirect('/purchases');
    } catch (error) {
        res.status(500).send(error.message);
    }
};
exports.deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        await Purchase.delete(id);
        res.redirect('/purchases');
    } catch (error) {
        res.status(500).send(error.message);
    }
};