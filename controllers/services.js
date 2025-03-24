const db = require("../config/db"); // Import your database configuration
exports.addOrUpdateService = async (req, res) => {
  try {
    // Accept both versions of property names
    const {
      id,
      total_price,
      moneyRceived, money_received,
      barberIncome, barber_income,
      employerIncome, employer_income,
      barber_name, barber_id,
      services
    } = req.body;

    // Use whichever properties are provided
    const barberId = barber_name || barber_id;
    const moneyReceived = moneyRceived || money_received;
    const barberIncomeValue = barberIncome || barber_income;
    const employerIncomeValue = employerIncome || employer_income;

    if (id && barberId) {
      // Update existing service - using original query structure
      await db.query(
        `UPDATE barber_services 
         SET barber_id = ?, total_price = ?, money_received = ?, barber_income = ?, employer_income = ?, service_date = NOW() 
         WHERE id = ?`,
        [barberId, total_price, moneyReceived, barberIncomeValue, employerIncomeValue, id]
      );

      // Delete old service details and insert new ones
      await db.query(`DELETE FROM barber_service_details WHERE barber_service_id = ?`, [id]);
      for (const serviceId of services) {
        await db.query(
          "INSERT INTO barber_service_details (barber_service_id, service_id) VALUES (?, ?)",
          [id, serviceId]
        );
      }

      res.status(200).json({ message: "Service updated successfully!" });
    } else if (barberId) {
      // Insert new service - using original query structure
      const result = await db.query(
        "INSERT INTO barber_services (barber_id, total_price, money_received, barber_income, employer_income, service_date) VALUES (?, ?, ?, ?, ?, NOW())",
        [barberId, total_price, moneyReceived, barberIncomeValue, employerIncomeValue]
      );

      const barberServiceId = result.insertId;

      // Insert services into `barber_service_details` table
      for (const serviceId of services) {
        await db.query(
          "INSERT INTO barber_service_details (barber_service_id, service_id) VALUES (?, ?)",
          [barberServiceId, serviceId]
        );
      }

      res.status(201).json({ message: "Service added successfully!" });
    } else {
      res.status(400).json({ error: "Missing required barber information" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to add or update service" });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    // Fetch services with related barber and service details
    const services = await db.query(`
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
    // GROUP BY bs.id, bs.total_price, bs.money_received, bs.barber_income, bs.employer_income, bs.service_date, b.Firstname, b.Lastname
    // Send the services data to the view
    res.render("services", { services });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch services.");
  }
};



// // Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided to delete" });
    }

    // Generate placeholders for the query
    const placeholders = ids.map(() => "?").join(",");

    // Delete related services from `barber_service_details`
    await db.query(
      `DELETE FROM barber_service_details WHERE barber_service_id IN (${placeholders})`,
      ids
    );

    // Delete the services from `barber_services`
    await db.query(
      `DELETE FROM barber_services WHERE id IN (${placeholders})`,
      ids
    );

    res.status(200).json({ message: "Services deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete service" });
  }
};
