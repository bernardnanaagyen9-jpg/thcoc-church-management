const express = require('express');
const router = express.Router();
const Thanksgiving = require('../models/Thanksgiving');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const churchId = req.user.churchId?._id || req.user.churchId;
const records = await Thanksgiving.find({ churchId }).sort({ sundayDate: -1 });
    res.json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const record = await Thanksgiving.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { sundayDate, entries } = req.body;
    if (!sundayDate || !entries || entries.length === 0)
      return res.status(400).json({ message: 'Date and at least one entry required' });
    const churchId = req.user.churchId?._id || req.user.churchId;
const record = await Thanksgiving.create({ sundayDate: new Date(sundayDate), entries, churchId, addedBy: req.user._id });
    res.status(201).json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const record = await Thanksgiving.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.sundayDate = req.body.sundayDate ? new Date(req.body.sundayDate) : record.sundayDate;
    record.entries = req.body.entries || record.entries;
    await record.save();
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await Thanksgiving.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Thanksgiving record deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;