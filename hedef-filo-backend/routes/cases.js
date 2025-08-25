const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const CaseType = require('../models/CaseType');
const StatusCode = require('../models/StatusCode');
const Case = require('../models/Case');
const CaseEvent = require('../models/CaseEvent');
const Survey = require('../models/Survey');
const Notification = require('../models/Notification');
async function ensureCustomerByCustomerId(customerId) {
  const norm = String(customerId).trim();
  let c = await Customer.findOne({ customerId: norm });
  if (!c) c = await Customer.create({ customerId: norm });
  return c;
}
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.customerId) {
    const c = await Customer.findOne({ customerId: String(req.query.customerId).trim() });
    if (!c) return res.json([]);
    filter.customer = c._id;
  }
  if (req.query.caseTypeCode) {
    const caseType = await CaseType.findOne({ code: req.query.caseTypeCode });
    if (caseType) filter.caseType = caseType._id;
  }
  if (req.query.statusCode) {
    const status = await StatusCode.findOne({ code: parseInt(req.query.statusCode) });
    if (status) filter.lastState = status._id;
  }
  const rows = await Case.find(filter)
    .sort({ createDate: -1 })
    .populate('customer caseType supplier lastState');
  res.json(rows);
});
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const row = await Case.findById(req.params.id)
    .populate('customer caseType supplier lastState');
  if (!row) return res.status(404).json({ error: 'Not found' });
  const timeline = await CaseEvent.find({ case: row._id })
    .sort({ createdAt: 1 })
    .populate('fromStatus toStatus');
  const survey = await Survey.findOne({ case: row._id });
  res.json({ case: row, timeline, survey });
});
router.post('/', async (req, res) => {
  const { caseId, customerId, caseTypeCode, supplierId } = req.body;
  if (!caseId || !customerId || !caseTypeCode) {
    return res.status(400).json({ error: 'caseId, customerId, caseTypeCode required' });
  }
  const customer = await ensureCustomerByCustomerId(customerId);
  const caseType = await CaseType.findOne({ code: caseTypeCode });
  if (!caseType) return res.status(400).json({ error: 'Invalid caseTypeCode' });
  let supplier = null;
  if (supplierId) {
    supplier = await Supplier.findOneAndUpdate(
      { supplierId }, { supplierId }, { new: true, upsert: true }
    );
  }
  const openStatus = await StatusCode.findOne({ code: 1 });
  const now = new Date();
  const created = await Case.create({
    caseId,
    customer: customer._id,
    caseType: caseType._id,
    supplier: supplier?._id,
    createDate: now,
    lastState: openStatus._id
  });
  await CaseEvent.create({
    case: created._id,
    type: 'STATUS_CHANGED',
    toStatus: openStatus._id,
    createdAt: now
  });
  await Notification.create({
    case: created._id,
    customer: customer._id,
    message: `Case #${caseId} created`,
    createdAt: now
  });
  const populated = await Case.findById(created._id)
    .populate('customer caseType supplier lastState');
  res.status(201).json(populated);
});
router.put('/:id/status', async (req, res) => {
  const { statusCode } = req.body;
  if (!statusCode && statusCode !== 0) return res.status(400).json({ error: 'statusCode required' });
  const row = await Case.findById(req.params.id).populate('lastState');
  if (!row) return res.status(404).json({ error: 'Not found' });
  const next = await StatusCode.findOne({ code: statusCode });
  if (!next) return res.status(400).json({ error: 'Invalid statusCode' });
  const from = row.lastState;
  row.lastState = next._id;
  if (next.isTerminal) row.completionDate = new Date();
  await row.save();
  await CaseEvent.create({
    case: row._id,
    type: 'STATUS_CHANGED',
    fromStatus: from?._id,
    toStatus: next._id,
    createdAt: new Date()
  });
  await Notification.create({
    case: row._id,
    customer: row.customer,
    message: `Case #${row.caseId} status changed to ${next.name}`,
    createdAt: new Date()
  });
  const populated = await Case.findById(row._id)
    .populate('customer caseType supplier lastState');
  res.json(populated);
});
router.put('/:id/supplier', async (req, res) => {
  const { supplierId } = req.body;
  const row = await Case.findById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const supplier = await Supplier.findOneAndUpdate(
    { supplierId }, { supplierId }, { new: true, upsert: true }
  );
  row.supplier = supplier._id;
  await row.save();
  await CaseEvent.create({
    case: row._id,
    type: 'SERVICE_CHANGED',
    note: `Supplier changed to ${supplierId}`,
    createdAt: new Date()
  });
  await Notification.create({
    case: row._id,
    customer: row.customer,
    message: `Case #${row.caseId} supplier changed`,
    createdAt: new Date()
  });
  const populated = await Case.findById(row._id)
    .populate('customer caseType supplier lastState');
  res.json(populated);
});
router.post('/:id/survey', async (req, res) => {
  const row = await Case.findById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const created = await Survey.findOneAndUpdate(
    { case: row._id },
    { case: row._id, rating: req.body.rating, comment: req.body.comment, createdAt: new Date() },
    { new: true, upsert: true }
  );
  res.json(created);
});
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid case ID' });
  }
  try {
    const caseToDelete = await Case.findById(req.params.id);
    if (!caseToDelete) {
      return res.status(404).json({ error: 'Case not found' });
    }
    await Survey.deleteMany({ case: caseToDelete._id });
    await Notification.deleteMany({ case: caseToDelete._id });
    await CaseEvent.deleteMany({ case: caseToDelete._id });
    await Case.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: `Case #${caseToDelete.caseId} and all related data deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while deleting case' });
  }
});
module.exports = router;
