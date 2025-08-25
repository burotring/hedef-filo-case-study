const mongoose = require('mongoose');
const StatusCodeSchema = new mongoose.Schema({
  code: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  isTerminal: { type: Boolean, default: false },
  description: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('StatusCode', StatusCodeSchema);
