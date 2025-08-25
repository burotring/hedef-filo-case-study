const mongoose = require('mongoose');
const SurveySchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Survey', SurveySchema);
