// const db = require("../config/db")
// const wallets = require('../models/wallets');

// exports.getWalletByDate = async (req, res) => {
//     try {
//         const { barber_name, startDate, endDate } = req.body;

//         // Validate input
//         // if (!startDate || !endDate) {
//         //     return res.status(400).send("Start and end dates are required");
//         // }
//         const expenses = await db.query(`
//         SELECT 
//             e.Id, 
//             SUM(e.Amount) AS Amount,
//             DATE_FORMAT(e.Expense_date, '%Y-%m-%d') AS Expense_date, 
//             e.Description, 
//             c.Category_name
//             FROM expenses e
//             JOIN expense_categories c ON e.category_Id = c.id
//             WHERE DATE(e.Expense_date) BETWEEN ? AND ?
//         ORDER BY e.Expense_date DESC
//     `, [startDate, endDate]);


//         // Query data using the Wallet model
//         const barbers = await db.query("SELECT * FROM barbers");
//         const results = await wallets.sumPriceByDateAndBarber(startDate, endDate, barber_name);
//         let wallet = 0
//         wallet = results[0].money_received - expenses[0].Amount;

//         // Render results in the table
//         res.render("wallet", { barbers, wallet, expense: expenses[0].Amount, mode: true, results, total_services: results[0].total_services, startDate, endDate, barber_name });
//     } catch (error) {
//         res.redirect("/admin/wallet")
//     }
// };

const db = require("../config/db");
const wallets = require('../models/wallets');

exports.getWalletByDate = async (req, res) => {
    try {
        const { barber_name, startDate, endDate } = req.body;

        // Fetch expenses for the given date range
        const expenses = await db.query(`
            SELECT 
                e.Id,
                SUM(e.Amount) AS Amount,
                DATE_FORMAT(e.Expense_date, '%Y-%m-%d') AS Expense_date,
                e.Description,
                c.Category_name
            FROM expenses e
            JOIN expense_categories c ON e.category_Id = c.id
            WHERE DATE(e.Expense_date) BETWEEN ? AND ?
            ORDER BY e.Expense_date DESC
        `, [startDate, endDate]);

        // Fetch total purchases amount
        const purchases = await db.query(`
            SELECT 
                SUM(total_amount) AS total_purchases,
                COUNT(purchase_id) AS total_purchase_ids
            FROM purchases 
            WHERE DATE(purchase_date) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // Fetch total sales amount
        const sales = await db.query(`
            SELECT 
                SUM(total_amount) AS total_sales, 
                COUNT(sale_id) AS total_sale_ids
            FROM sales 
            WHERE DATE(sale_date) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // Fetch barbers and wallet results
        const barbers = await db.query("SELECT * FROM barbers");
        const results = await wallets.sumPriceByDateAndBarber(startDate, endDate, barber_name);

        // Calculate wallet balance
        let wallet = 0;
        let totalExpenses = expenses[0].Amount || 0;
        let totalPurchases = purchases[0].total_purchases || 0;
        let totalSales = sales[0].total_sales || 0;

        // Basic wallet calculation (you might want to adjust this based on your specific business logic)
        wallet = totalSales - totalExpenses - totalPurchases + results[0].money_received;
        // const total_cus_pur_sal = results[0].total_services + purchases[0].total_purchase_ids + sales[0].total_sale_ids
        const total_cus_pur_sal = results[0].total_services  + sales[0].total_sale_ids

        // Render results
        res.render("wallet", {
            barbers,
            wallet,
            expense: totalExpenses,
            total_purchases: totalPurchases,
            total_sales: totalSales,
            mode: true,
            results,
            total_services: results[0].total_services,
            total_purchase_ids: purchases[0].total_purchase_ids,
            total_sale_ids: sales[0].total_sale_ids,
            total_cus_pur_sal,
            startDate,
            endDate,
            barber_name
        });

    } catch (error) {
        console.error("Error in getWalletByDate:", error);
        res.redirect("/admin/wallet");
    }
};