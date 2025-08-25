const mongoose = require('mongoose');
const CaseSchema = new mongoose.Schema({
  caseId: { type: Number, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  caseType: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseType', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createDate: { type: Date, required: true, default: Date.now },
  lastState: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusCode', required: true },
  completionDate: { type: Date }
}, { timestamps: true });
CaseSchema.index({ customer: 1, createDate: -1 });
CaseSchema.index({ lastState: 1 });
module.exports = mongoose.model('Case', CaseSchema);
