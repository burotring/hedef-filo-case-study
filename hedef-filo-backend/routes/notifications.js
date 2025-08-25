const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
router.get('/', async (req, res) => {
  const qId = req.query.customerId && String(req.query.customerId).trim();
  if (!qId) return res.status(400).json({ error: 'customerId required' });
  const c = await Customer.findOne({ customerId: qId });
  if (!c) return res.json([]);
  const rows = await Notification.find({ customer: c._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('case');
  res.json(rows);
});
router.put('/:id/read', async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  await notification.save();
  res.json(notification);
});
router.put('/mark-all-read', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId required' });
  const c = await Customer.findOne({ customerId: String(customerId).trim() });
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  await Notification.updateMany(
    { customer: c._id, read: false },
    { read: true }
  );
  res.json({ success: true });
});
module.exports = router;
