const db = require('../config/db');

const Wallet = {

  sumPriceByDateAndBarber: async (startDate, endDate, barberId) => {
    if (barberId !== "all") {

      const query = `
      SELECT 
        b.Firstname AS barber_name,
        COUNT(bs.id) AS total_services,
        DATE(bs.service_date) AS service_date,
        SUM(bs.total_price) AS total_price,
        SUM(bs.money_received) AS money_received,
        SUM(bs.barber_income) AS barber_income,
        SUM(bs.employer_income) AS employer_income
      FROM barber_services bs
      JOIN barbers b ON bs.barber_id = b.Id
      WHERE DATE(bs.service_date) BETWEEN ? AND ?
      ${barberId ? "AND b.Id = ?" : ""}
      GROUP BY b.Firstname, DATE(bs.service_date)
      ORDER BY DATE(bs.service_date) ASC
    `;

      const params = barberId ? [startDate, endDate, barberId] : [startDate, endDate];
      const rows = await db.query(query, params);
      return rows;
    } else {
      const rows = await db.query(`
      SELECT 
        b.Firstname AS barber_name,
        COUNT(bs.id) AS total_services,
        DATE(bs.service_date) AS service_date,
        SUM(bs.total_price) AS total_price,
        SUM(bs.money_received) AS money_received,
        SUM(bs.barber_income) AS barber_income,
        SUM(bs.employer_income) AS employer_income
      FROM barber_services bs
      JOIN barbers b ON bs.barber_id = b.Id
      WHERE DATE(bs.service_date) BETWEEN ? AND ?
    `, [startDate, endDate]);
      return rows;
    }
  }

};

module.exports = Wallet
