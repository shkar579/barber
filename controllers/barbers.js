const barbers = require('../models/barbers');

// Add New Row
exports.Addbarber = (async (req, res) => {
  await barbers.create(req.body);
  res.json({ success: true });
});
exports.Deletebarber = (async (req, res) => {
  barbers.delete(req.body.ids)
  res.json({ success: true });
});

exports.editdetailbarber = (async (req, res) => {
  const { id } = req.params;

  barbers.getById(id, res)
});

// Edit Row
exports.Updatebarber = (async (req, res) => {
  const { id } = req.params;
  barbers.update(id, req.body)
  res.json({ success: true });
});

exports.Viewbarber = (async (req, res) => {
  const { id } = req.params;
  barbers.getById(id, res)

});