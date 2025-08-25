const express = require('express');
const router = express.Router();
const CaseType = require('../models/CaseType');
const StatusCode = require('../models/StatusCode');
router.get('/case-types', async (_req, res) => {
  const rows = await CaseType.find().sort({ name: 1 });
  res.json(rows);
});
router.get('/status-codes', async (_req, res) => {
  const rows = await StatusCode.find().sort({ code: 1 });
  res.json(rows);
});
router.post('/seed', async (_req, res) => {
  if (await CaseType.countDocuments() === 0) {
    await CaseType.insertMany([
      { code: 'ACCIDENT', name: 'Accident' },
      { code: 'DAMAGE', name: 'Damage' }
    ]);
  }
  if (await StatusCode.countDocuments() === 0) {
    await StatusCode.insertMany([
      { code: 1, name: 'Açık', isTerminal: false, description: 'Yeni oluşturulan vaka' },
      { code: 2, name: 'İnceleniyor', isTerminal: false, description: 'Vaka inceleme aşamasında' },
      { code: 3, name: 'Tamamlandı', isTerminal: true, description: 'Vaka başarıyla tamamlandı' }
    ]);
  }
  res.json({ ok: true });
});
module.exports = router;
