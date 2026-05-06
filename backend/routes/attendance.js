const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('memberAttendance.member', 'fullName memberId gender membershipType')
      .populate('travellerAttendance.traveller', 'fullName gender')
      .sort({ sundayDate: -1 });
    res.json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('memberAttendance.member', 'fullName memberId gender membershipType')
      .populate('travellerAttendance.traveller', 'fullName gender');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { sundayDate, memberAttendance, travellerAttendance, intermediateClass, childrenService } = req.body;
    if (!sundayDate) return res.status(400).json({ message: 'Sunday date is required' });
    const date = new Date(sundayDate);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(sundayDate).setHours(23, 59, 59, 999));
    const existing = await Attendance.findOne({ sundayDate: { $gte: startOfDay, $lte: endOfDay } });
    if (existing) return res.status(400).json({ message: 'Attendance already marked for this Sunday. Please edit instead.' });
    const record = await Attendance.create({
      sundayDate: new Date(sundayDate),
      memberAttendance: memberAttendance || [],
      travellerAttendance: travellerAttendance || [],
      intermediateClass: intermediateClass || 0,
      childrenService: childrenService || 0,
      markedBy: req.user._id
    });
    await updateMemberFlags();
    await record.populate('memberAttendance.member', 'fullName memberId gender membershipType');
    await record.populate('travellerAttendance.traveller', 'fullName gender');
    res.status(201).json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { memberAttendance, travellerAttendance, intermediateClass, childrenService } = req.body;
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.memberAttendance = memberAttendance || record.memberAttendance;
    record.travellerAttendance = travellerAttendance || record.travellerAttendance;
    record.intermediateClass = intermediateClass !== undefined ? intermediateClass : record.intermediateClass;
    record.childrenService = childrenService !== undefined ? childrenService : record.childrenService;
    await record.save();
    await updateMemberFlags();
    await record.populate('memberAttendance.member', 'fullName memberId gender membershipType');
    await record.populate('travellerAttendance.traveller', 'fullName gender');
    res.json(record);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

async function updateMemberFlags() {
  try {
    const lastTwo = await Attendance.find().sort({ sundayDate: -1 }).limit(2);
    const allMembers = await Member.find();
    for (const member of allMembers) {
      let consecutiveAbsences = 0;
      for (const rec of lastTwo) {
        const entry = rec.memberAttendance.find(a => a.member.toString() === member._id.toString());
        if (entry && entry.status === 'Absent') consecutiveAbsences++;
        else break;
      }
      const isFlagged = consecutiveAbsences >= 2;
      await Member.findByIdAndUpdate(member._id, { consecutiveAbsences, isFlagged });
    }
  } catch (error) { console.error('Flag update error:', error); }
}

module.exports = router;