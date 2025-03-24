const expenses = require('../models/expenses');

// Add New Row
exports.Addexpense = (async (req, res) => {
  await expenses.create(req.body);
  res.json({ success: true });
});
exports.Deleteexpense = (async (req, res) => {
  expenses.delete(req.body.ids)
  res.json({ success: true });
});

exports.editdetailexpense = (async (req, res) => {
  const { id } = req.params;

 expenses.getById(id, res)
});

// // Edit Row
exports.Updateexpense = (async (req, res) => {
  const { id } = req.params;
  expenses.update(id, req.body)
  res.json({ success: true });
});

// exports.Viewbarber = (async (req, res) => {
//   const { id } = req.params;
//   barbers.getById(id, res)

// });