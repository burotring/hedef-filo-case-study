const mongoose = require('mongoose');
const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String
}, { timestamps: true });
module.exports = mongoose.model('Customer', CustomerSchema);
