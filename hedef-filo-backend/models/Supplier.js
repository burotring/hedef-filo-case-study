const mongoose = require('mongoose');
const SupplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true },
  name: String,
  phone: String
}, { timestamps: true });
module.exports = mongoose.model('Supplier', SupplierSchema);
