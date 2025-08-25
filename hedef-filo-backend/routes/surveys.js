const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Customer = require('../models/Customer');
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.customerId) {
    const c = await Customer.findOne({ customerId: String(req.query.customerId).trim() });
    if (!c) return res.json([]);
    const Case = require('../models/Case');
    const customerCases = await Case.find({ customer: c._id }).select('_id');
    const caseIds = customerCases.map(c => c._id);
    filter.case = { $in: caseIds };
  }
  const rows = await Survey.find(filter)
    .sort({ createdAt: -1 })
    .populate({
      path: 'case',
      populate: [
        { path: 'customer' },
        { path: 'caseType' },
        { path: 'lastState' }
      ]
    });
  res.json(rows);
});
router.get('/stats', async (req, res) => {
  const stats = await Survey.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  const totalCount = await Survey.countDocuments();
  const avgRating = await Survey.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  res.json({
    totalSurveys: totalCount,
    averageRating: avgRating[0]?.avgRating || 0,
    ratingDistribution: stats
  });
});
module.exports = router;
