const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/attendance-summary', protect, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('memberAttendance.member', 'fullName memberId gender membershipType')
      .sort({ sundayDate: -1 });
    const summary = records.map(rec => ({
      _id: rec._id,
      sundayDate: rec.sundayDate,
      stats: rec.stats,
      intermediateClass: rec.intermediateClass,
      childrenService: rec.childrenService,
      totalMembers: rec.memberAttendance.length,
      presentMembers: rec.memberAttendance.filter(a => a.status === 'Present').length
    }));
    res.json(summary);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/flagged-members', protect, adminOnly, async (req, res) => {
  try {
    const flagged = await Member.find({ isFlagged: true }).sort({ fullName: 1 });
    res.json(flagged);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/member-attendance/:memberId', protect, adminOnly, async (req, res) => {
  try {
    const records = await Attendance.find({ 'memberAttendance.member': req.params.memberId }).sort({ sundayDate: -1 });
    const history = records.map(rec => {
      const entry = rec.memberAttendance.find(a => a.member.toString() === req.params.memberId);
      return { sundayDate: rec.sundayDate, status: entry ? entry.status : 'Not Recorded' };
    });
    res.json(history);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/overview', protect, async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const flaggedMembers = await Member.countDocuments({ isFlagged: true });
    const lastAttendance = await Attendance.findOne().sort({ sundayDate: -1 });
    const totalSundays = await Attendance.countDocuments();
    res.json({
      totalMembers, flaggedMembers,
      lastAttendanceTotal: lastAttendance ? lastAttendance.stats.total : 0,
      lastAttendanceDate: lastAttendance ? lastAttendance.sundayDate : null,
      totalSundays
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;