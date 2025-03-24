const express = require('express');
const router = express.Router();
const db = require("../config/db")
const controller = require('../controllers/services');
const excelJS = require('exceljs');
const isAuth = require("../middleware/is-auth");
const roleAuth = require("../middleware/role");

router.post("/addOrUpdateService", isAuth, controller.addOrUpdateService);
router.get("/services", isAuth, controller.getAllServices);
router.post("/Deleteservice", isAuth, roleAuth, controller.deleteService);
router.get("/getService/:id", isAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the main barber service record
        const service = await db.query(
            `SELECT 
          bs.id, 
          bs.barber_id, 
          bs.total_price, 
          bs.money_received, 
          bs.barber_income, 
          bs.employer_income, 
          bs.service_date 
        FROM barber_services bs 
        WHERE bs.id = ?`,
            [id]
        );

        // Fetch associated services for the record
        const serviceDetails = await db.query(
            `SELECT s.Id, s.Service, s.Price 
         FROM barber_service_details bsd 
         JOIN services s ON bsd.service_id = s.Id 
         WHERE bsd.barber_service_id = ?`,
            [id]
        );

        const sFind = service.find(service => service)
        if (sFind) {
            // Fetch barbers for the dropdown
            const barbers = await db.query(`SELECT Id, Firstname, Lastname FROM barbers`);
            // Fetch all available services for checkboxes
            const allServices = await db.query(`SELECT Id, Service, Price FROM services`);
            res.render("dashboard", { service, serviceDetails, barbers, allServices, editMode: true });
        } else {
            res.render("404");
        }


    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch service details.");
    }
});

router.get('/Exportservices', isAuth, roleAuth, async (req, res) => {
    try {
        // Fetch services with related barber and service details
        const rows = await db.query(`
         SELECT 
           bs.id AS barber_service_id,
           bs.barber_id AS barber_id,
           bs.total_price,
           bs.money_received,
           bs.barber_income,
           bs.employer_income,
           DATE_FORMAT(bs.service_date, '%Y-%m-%d') AS service_date ,
           b.Firstname AS barber_firstname,
           b.Lastname AS barber_lastname,
           GROUP_CONCAT(s.Service SEPARATOR ', ') AS service_list,
           GROUP_CONCAT(s.Price SEPARATOR ', ') AS price_list
         FROM barber_services bs
         JOIN barbers b ON bs.barber_id = b.Id
         JOIN barber_service_details bsd ON bs.id = bsd.barber_service_id
         JOIN services s ON bsd.service_id = s.id
         GROUP BY bs.id
         ORDER BY bs.id DESC
         `);

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('expenses');

        // Add Columns
        worksheet.columns = [
            { header: 'id', key: 'barber_service_id', width: 30 },
            { header: 'Firstname', key: 'barber_firstname', width: 30 },
            { header: 'Lastname', key: 'barber_lastname', width: 30 },
            { header: 'Service', key: 'service_list', width: 30 },
            { header: 'Price', key: 'price_list', width: 30 },
            { header: 'total_price', key: 'total_price', width: 30 },
            { header: 'money_received', key: 'money_received', width: 30 },
            { header: 'barber_income', key: 'barber_income', width: 30 },
            { header: 'employer_income', key: 'employer_income', width: 30 },
            { header: 'service_date', key: 'service_date', width: 30 },
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
    } catch (error) {
        res.redirect("/admin/services")
    }

});

module.exports = router;
