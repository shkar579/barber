const category = require('../models/service-category');

// Add New Row
exports.Addcategory = (async (req, res) => {
  await category.create(req.body);
  res.json({ success: true });
});
exports.Deletecategory = (async (req, res) => {
  category.delete(req.body.ids)
  res.json({ success: true });
});

exports.editdetailcategory = (async (req, res) => {
  const { id } = req.params;

  category.getById(id, res)
});

// // Edit Row
exports.Updatecategory = (async (req, res) => {
  const { id } = req.params;
  category.update(id, req.body)
  res.json({ success: true });
});
