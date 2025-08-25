const mongoose = require('mongoose');
const CaseTypeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('CaseType', CaseTypeSchema);
