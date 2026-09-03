const express = require('express');
const router = express.Router();
const JointService = require('../models/JointService');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const churchId = req.user.churchId?._id || req.user.churchId;
const records = await JointService.find({ churchId }).sort({ serviceDate: -1 });
    res.json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const record = await JointService.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { serviceDate, title, congregations } = req.body;
    if (!serviceDate || !congregations || congregations.length === 0)
      return res.status(400).json({ message: 'Date and congregations required' });
    const churchId = req.user.churchId?._id || req.user.churchId;
const record = await JointService.create({ serviceDate: new Date(serviceDate), title, congregations, churchId, addedBy: req.user._id });
    res.status(201).json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await JointService.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.serviceDate = req.body.serviceDate ? new Date(req.body.serviceDate) : record.serviceDate;
    record.title = req.body.title || record.title;
    record.congregations = req.body.congregations || record.congregations;
    await record.save();
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await JointService.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Joint service record deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;