const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
NotificationSchema.index({ customer: 1, createdAt: -1 });
NotificationSchema.index({ read: 1 });
module.exports = mongoose.model('Notification', NotificationSchema);
