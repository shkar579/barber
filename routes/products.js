const express = require('express');
const router = express.Router();
const db = require("../config/db")
const products = require('../models/products');
const controller = require('../controllers/barbers');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");
const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.get('/products', isAuth, roleAuth, (req, res) => {
    // First query to get products with their category names
    const productsQuery = `
        SELECT p.*, c.name as category_name,
        DATE_FORMAT(p.expiry_date, '%Y-%m-%d') as expiry_date,
        DATE_FORMAT(p.date_added, '%Y-%m-%d') as date_added
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
    `;

    // Second query to get all categories for the dropdown
    const categoriesQuery = `
        SELECT category_id, name as category_name 
        FROM categories
    `;

    // Execute the products query
    db.query(productsQuery, (error, products) => {
        if (error) {
            console.error('Error fetching products:', error);
            return res.status(500).send('Database error');
        }

        // Execute the categories query
        db.query(categoriesQuery, (error, categories) => {
            if (error) {
                console.error('Error fetching categories:', error);
                return res.status(500).send('Database error');
            }

            // Render the template with both products and categories
            res.render('products', {
                products: products,
                categories: categories,
                title: 'All Products'
            });
        });
    });
});

router.post('/addProduct', isAuth, roleAuth, upload.single('image'), async (req, res) => {
    try {
        // Create product object from form data
        const productData = {
            title: req.body.title,
            cost: req.body.cost,
            price: req.body.price,
            description: req.body.description,
            category_id: req.body.category_id,
            stock: req.body.stock || 0,
            expiry_date: req.body.expiry_date || null,
            popular: req.body.popular === '1' ? 1 : 0,
            is_new: req.body.is_new === '1' ? 1 : 0,
            date_added: req.body.date_added || new Date().toISOString().split('T')[0],
            image: req.file ? `/images/${req.file.filename}` : null
        };

        // Create the product
        const result = await products.create(productData);

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId: result.insertId
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add product",
            error: error.message
        });
    }
});

router.post('/updateProduct/:id',isAuth,roleAuth, upload.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;

        // Get the existing product to check if we need to preserve the existing image
        let existingImage = null;
        try {
            const [existingProduct] = await db.query('SELECT image FROM products WHERE id = ?', [productId]);
            if (existingProduct && existingProduct.length > 0) {
                existingImage = existingProduct[0].image;
            }
        } catch (err) {
            console.log("Could not fetch existing product image:", err);
            // Continue with update even if we couldn't get the existing image
        }

        // Create product object from form data
        const productData = {
            title: req.body.title,
            cost: req.body.cost,
            price: req.body.price,
            description: req.body.description,
            category_id: req.body.category_id,
            stock: req.body.stock || 0,
            expiry_date: req.body.expiry_date || null,
            popular: req.body.popular === '1' ? 1 : 0,
            is_new: req.body.is_new === '1' ? 1 : 0,
            date_added: req.body.date_added || new Date().toISOString().split('T')[0],
            // Use new image if uploaded, otherwise keep existing image
            image: req.file ? `/images/${req.file.filename}` : existingImage
        };

        // Update the product
        const result = await products.update(productId, productData);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            productId: productId
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
});

router.get('/getProduct/:id',isAuth,roleAuth, async (req, res) => {
    try {
        await products.getById(req.params.id, res);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
});

router.post('/deleteProducts', isAuth, roleAuth, (req, res) => {
    products.delete(req.body.ids)
    res.json({ success: true });
});

router.get('/exportProducts', isAuth, roleAuth, async (req, res) => {
    const rows = await db.query('SELECT * FROM products');
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('products');

    // Add Columns
    worksheet.columns = [
        { header: 'ئایدی', key: 'id', width: 30 },
        { header: 'ناو', key: 'title', width: 30 },
        { header: 'نرخی کڕین', key: 'cost', width: 30 },
        { header: 'نرخ', key: 'price', width: 30 },
        { header: 'وێنە', key: 'image', width: 30 },
        { header: 'جۆر', key: 'category_id', width: 30 },
        { header: 'بڕ', key: 'stock', width: 30 },
        { header: 'ناسراو', key: 'popular', width: 30 },
        { header: 'نوێ', key: 'is_new', width: 30 },
        { header: 'بەرواری بەسەرچوون', key: 'expiry_date', width: 30 },
        { header: 'بەرواری زیادکردن', key: 'date_added', width: 30 },
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