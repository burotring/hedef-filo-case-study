const mongoose = require('mongoose');
const CaseEventSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  type: { type: String, enum: ['STATUS_CHANGED','SERVICE_CHANGED','NOTE'], required: true },
  fromStatus: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusCode' },
  toStatus: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusCode' },
  note: String,
  createdAt: { type: Date, default: Date.now }
});
CaseEventSchema.index({ case: 1, createdAt: 1 });
module.exports = mongoose.model('CaseEvent', CaseEventSchema);
