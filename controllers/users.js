const users = require('../models/users');

// Add New Row
exports.Adduser = (async (req, res) => {
  await users.create(req.body);
  res.json({ success: true });
});

exports.Deleteuser = (async (req, res) => {
  users.delete(req.body.ids)
  res.json({ success: true });
});

exports.editdetailuser = (async (req, res) => {
  const { id } = req.params;

  users.getById(id, res)
});

// Edit Row
exports.Updateuser = (async (req, res) => {
  const { id } = req.params;
  users.update(id, req.body)
  res.json({ success: true });
});

exports.Viewuser = (async (req, res) => {
  const { id } = req.params;
  users.getById(id, res)

});



