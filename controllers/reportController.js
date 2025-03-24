const db = require("../config/db");
const moment = require('moment');

exports.getSalesReport = async (req, res) => {
    let connection;
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Filter parameters
        const filters = {
            startDate: req.query.startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: req.query.endDate || moment().format('YYYY-MM-DD'),
            paymentMethod: req.query.paymentMethod || '',
            status: req.query.status || ''
        };

        // Build query conditions
        let conditions = [`sale_date BETWEEN ? AND ?`];
        let queryParams = [
            `${filters.startDate} 00:00:00`,
            `${filters.endDate} 23:59:59`
        ];

        if (filters.paymentMethod) {
            conditions.push('payment_method = ?');
            queryParams.push(filters.paymentMethod);
        }

        if (filters.status) {
            conditions.push('status = ?');
            queryParams.push(filters.status);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count for pagination
        const countResult = await db.query(
            `SELECT COUNT(*) AS total FROM sales ${whereClause}`,
            queryParams
        );
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // Get sales data with pagination
        const sales = await db.query(
            `SELECT * FROM sales ${whereClause} ORDER BY sale_date DESC LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset]
        );

        // Get sales details with product info
        for (let sale of sales) {
            const details = await db.query(
                `SELECT sd.*, p.title, p.cost, p.price 
           FROM sales_details sd 
           JOIN products p ON sd.product_id = p.id 
           WHERE sd.sale_id = ?`,
                [sale.sale_id]
            );
            sale.products = details;
        }

        // Get sales statistics
        const totalSalesResult = await db.query(
            `SELECT SUM(total_amount) AS total FROM sales ${whereClause}`,
            queryParams
        );
        const totalSales = totalSalesResult[0].total || 0;

        // Calculate average sale
        const avgSale = totalItems > 0 ? totalSales / totalItems : 0;

        // Calculate estimated profit (based on product cost vs price)
        const profitResult = await db.query(
            `SELECT SUM((sd.unit_price - p.cost) * sd.quantity) AS profit
         FROM sales s
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         JOIN products p ON sd.product_id = p.id
         ${whereClause}`,
            queryParams
        );
        const totalProfit = profitResult[0].profit || 0;

        // Get sales trend data
        const salesTrend = await db.query(
            `SELECT DATE(sale_date) AS date, SUM(total_amount) AS total
         FROM sales
         ${whereClause}
         GROUP BY DATE(sale_date)
         ORDER BY date ASC`,
            queryParams
        );

        // Get top selling products
        const topProducts = await db.query(
            `SELECT p.id, p.title, SUM(sd.quantity) AS totalQuantity, 
                SUM(sd.quantity * sd.unit_price) AS totalRevenue
         FROM sales s
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         JOIN products p ON sd.product_id = p.id
         ${whereClause}
         GROUP BY p.id
         ORDER BY totalQuantity DESC
         LIMIT 5`,
            queryParams
        );

        // Get product summary
        const productSummary = await db.query(
            `SELECT p.id, p.title, SUM(sd.quantity) AS totalQuantity, 
                SUM(sd.quantity * sd.unit_price) AS totalRevenue,
                SUM(sd.quantity * sd.unit_price) / SUM(sd.quantity) AS avgPrice
         FROM sales s
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         JOIN products p ON sd.product_id = p.id
         ${whereClause}
         GROUP BY p.id
         ORDER BY totalRevenue DESC`,
            queryParams
        );

        // Get payment method distribution
        const paymentMethods = await db.query(
            `SELECT payment_method AS method, COUNT(*) AS count
         FROM sales
         ${whereClause}
         GROUP BY payment_method`,
            queryParams
        );

        // Get category data
        const categoryData = await db.query(
            `SELECT c.name, SUM(sd.quantity * sd.unit_price) AS revenue
         FROM sales s
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         JOIN products p ON sd.product_id = p.id
         JOIN categories c ON p.category_id = c.category_id
         ${whereClause}
         GROUP BY c.category_id
         ORDER BY revenue DESC`,
            queryParams
        );

        // Get monthly comparison data
        const currentMonthStart = moment().startOf('month').format('YYYY-MM-DD');
        const currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD');
        const previousMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        const previousMonthEnd = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

        const currentMonthData = await db.query(
            `SELECT SUM(total_amount) AS total
       FROM sales
       WHERE sale_date BETWEEN ? AND ?`,
            [`${currentMonthStart} 00:00:00`, `${currentMonthEnd} 23:59:59`]
        );

        const previousMonthData = await db.query(
            `SELECT SUM(total_amount) AS total
       FROM sales
       WHERE sale_date BETWEEN ? AND ?`,
            [`${previousMonthStart} 00:00:00`, `${previousMonthEnd} 23:59:59`]
        );

        const currentMonthSales = currentMonthData[0].total || 0;
        const previousMonthSales = previousMonthData[0].total || 0;

        // Calculate monthly change percentage
        let monthlyChange = 0;
        if (previousMonthSales > 0) {
            monthlyChange = ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
        }

        // Build query string for pagination links
        let queryString = '';
        if (filters.startDate) queryString += `&startDate=${filters.startDate}`;
        if (filters.endDate) queryString += `&endDate=${filters.endDate}`;
        if (filters.paymentMethod) queryString += `&paymentMethod=${filters.paymentMethod}`;
        if (filters.status) queryString += `&status=${filters.status}`;

        // Render the report
        res.render('sales-report', {
            sales,
            totalSales,
            salesCount: totalItems,
            avgSale,
            totalProfit,
            currentPage: page,
            totalPages,
            filters,
            queryString,
            salesTrend,
            topProducts,
            productSummary,
            paymentMethods,
            categoryData,
            currentMonthSales,
            previousMonthSales,
            monthlyChange
        });

    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).send('Error generating sales report');
    }
};

exports.exportSalesCsv = async (req, res) => {
    try {
        // Filter parameters
        const filters = {
            startDate: req.query.startDate || moment().subtract(30, 'days').format('YYYY-MM-DD'),
            endDate: req.query.endDate || moment().format('YYYY-MM-DD'),
            paymentMethod: req.query.paymentMethod || '',
            status: req.query.status || ''
        };

        // Build query conditions
        let conditions = [`sale_date BETWEEN ? AND ?`];
        let queryParams = [
            `${filters.startDate} 00:00:00`,
            `${filters.endDate} 23:59:59`
        ];

        if (filters.paymentMethod) {
            conditions.push('payment_method = ?');
            queryParams.push(filters.paymentMethod);
        }

        if (filters.status) {
            conditions.push('status = ?');
            queryParams.push(filters.status);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get sales data
        const sales = await db.query(
            `SELECT s.*, DATE_FORMAT(s.sale_date, '%Y-%m-%d %H:%i:%s') as formatted_date 
       FROM sales s ${whereClause} 
       ORDER BY s.sale_date DESC`,
            queryParams
        );

        // Prepare CSV content
        let csvContent = 'Sale ID,Date,Total Amount,Payment Method,Status,Notes\n';

        for (const sale of sales) {
            csvContent += `${sale.sale_id},${sale.formatted_date},${sale.total_amount},${sale.payment_method},${sale.status},"${sale.notes || ''}"\n`;
        }

        // Set headers for CSV download
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
        res.setHeader('Content-Type', 'text/csv');

        // Send the CSV data
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting sales data:', error);
        res.status(500).send('Error exporting sales data');
    }
};