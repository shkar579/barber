const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const db = require("./config/db")
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", "views");

// Session Configuration
app.use(
  session({
    secret: "shkar",
    resave: false,
    saveUninitialized: false,
  })
);

// Other middleware and configurations
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({ secret: "your_secret", resave: false, saveUninitialized: true })
);



// Route Imports
const login = require("./routes/login")
const dashboard = require("./routes/dashboard")
const users = require("./routes/users")
const barbers = require("./routes/barbers")
const expenses = require("./routes/expenses")
const services = require("./routes/services")
const wallets = require("./routes/wallets")
const products = require("./routes/products")
const purchases = require("./routes/purchases")
const categories = require("./routes/category")
const serviceCategories = require("./routes/service-category")
const _404 = require("./routes/404")

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.user = req.session.user;
  // res.locals.csrfToken = req.csrfToken();
  next();
});

// Use Routes
app.use("/", login);
app.use("/admin", dashboard)
app.use("/admin", users);
app.use("/admin", barbers);
app.use("/admin", expenses);
app.use("/admin", services);
app.use("/admin", wallets);
app.use("/admin", products);
app.use("/admin", categories);
app.use("/admin", serviceCategories);

app.get('/', (req, res) => {
  res.redirect('/services');
});

// Get all services (products)
app.get('/services', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, COALESCE(SUM(i.quantity), 0) as stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE c.is_active = true
    GROUP BY p.id
    ORDER BY p.date_added DESC
  `;

  db.query(query, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Database error');
    }

    // Get all categories for the filter dropdown
    db.query('SELECT * FROM categories WHERE is_active = true', (err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Database error');
      }

      res.render('services2', {
        products: products,
        categories: categories,
        title: 'فرۆشتن '
      });
    });
  });
});

// Get a single product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;

  const query = `
    SELECT p.*, c.name as category_name, COALESCE(SUM(i.quantity), 0) as stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: results[0] });
  });
});

// Add a new service to cart (AJAX endpoint)
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;

  // Get product with inventory information
  const query = `
    SELECT p.*, c.name as category_name, COALESCE(SUM(i.quantity), 0) as stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `;

  db.query(query, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = results[0];

    // Check if there's enough stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sorry, we only have ${product.stock} units available.`
      });
    }

    // In a real application, you would store the cart in a session or database
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      product: product
    });
  });
});

// Process checkout (create a new sale)
app.post('/api/checkout', (req, res) => {
  const { items, totalAmount, customerPayment, discount } = req.body;

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Create a new sale record
    const saleQuery = `
      INSERT INTO sales (customer_id, total_amount, payment_method, notes)
      VALUES (?, ?, ?, ?)
    `;

    db.query(saleQuery, [null, totalAmount, 'cash', `Discount: ${discount}`], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ success: false, message: 'Error creating sale' });
        });
      }

      const saleId = result.insertId;

      // Create sale details and update inventory
      let detailsProcessed = 0;

      items.forEach(item => {
        // Insert sale detail
        const detailQuery = `
          INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, discount)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(detailQuery, [
          saleId,
          item.id,
          item.quantity,
          item.price,
          item.price * (discount / 100)  // Fixed discount calculation

        ], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ success: false, message: 'Error creating sale details' });
            });
          }

          // Update inventory by inserting a negative quantity record
          const inventoryQuery = `
            INSERT INTO inventory (product_id, quantity, location, last_updated)
            VALUES (?, ?, 'Sales deduction', CURRENT_TIMESTAMP)
          `;

          db.query(inventoryQuery, [item.id, -item.quantity], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ success: false, message: 'Error updating inventory' });
              });
            }

            detailsProcessed++;

            // If all details are processed, commit the transaction
            if (detailsProcessed === items.length) {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error committing transaction' });
                  });
                }

                res.status(200).json({
                  success: true,
                  message: 'Sale completed successfully',
                  saleId: saleId,
                  changeDue: customerPayment - totalAmount
                });
              });
            }
          });
        });
      });
    });
  });
});

// API endpoint to get filtered products
app.get('/api/products', (req, res) => {
  const { category, priceMin, priceMax, availability, sort, search } = req.query;

  let query = `
    SELECT p.*, c.name as category_name, COALESCE(SUM(i.quantity), 0) as stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE c.is_active = true
  `;

  const queryParams = [];

  // Apply filters
  if (category && category !== 'all') {
    query += ` AND c.name = ?`;
    queryParams.push(category);
  }

  if (priceMin && priceMax) {
    query += ` AND p.price BETWEEN ? AND ?`;
    queryParams.push(parseFloat(priceMin), parseFloat(priceMax));
  } else if (priceMin) {
    query += ` AND p.price >= ?`;
    queryParams.push(parseFloat(priceMin));
  }

  // Group by product id before applying stock filters
  query += ` GROUP BY p.id`;

  // Add HAVING clause for stock filtering
  if (availability && availability !== 'all') {
    if (availability === 'in-stock') {
      query += ` HAVING stock > 10`;
    } else if (availability === 'low-stock') {
      query += ` HAVING stock > 0 AND stock <= 10`;
    } else if (availability === 'out-of-stock') {
      query += ` HAVING stock = 0`;
    }
  }

  if (search) {
    if (!query.includes('HAVING')) {
      query += ` HAVING `;
    } else {
      query += ` AND `;
    }
    query += `(p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Apply sorting
  if (sort === 'price-low') {
    query += ` ORDER BY p.price ASC`;
  } else if (sort === 'price-high') {
    query += ` ORDER BY p.price DESC`;
  } else if (sort === 'popular') {
    query += ` ORDER BY p.popular DESC`;
  } else if (sort === 'newest') {
    query += ` ORDER BY p.date_added DESC`;
  } else {
    query += ` ORDER BY p.id ASC`;
  }

  db.query(query, queryParams, (err, products) => {
    if (err) {
      console.error('Error fetching filtered products:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, products: products });
  });
});

app.use('/admin', require('./routes/sales'));
app.use('/purchases', purchases);
app.get('/', (req, res) => {
  res.redirect('/purchases');
});

const inventoryRoutes = require('./routes/inventory');
app.use('/inventory', inventoryRoutes);
app.get('/', (req, res) => res.redirect('/inventory'));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

app.use(_404);

// Start Server
app.listen(3000, () => {
  console.log("http://localhost:3000");
});



