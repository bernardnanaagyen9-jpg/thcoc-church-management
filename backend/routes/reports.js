const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/attendance-summary', protect, async (req, res) => {
  try {
const churchId = req.user.churchId?._id || req.user.churchId;
const records = await Attendance.find({ churchId })      .populate('memberAttendance.member', 'fullName memberId gender membershipType')
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
const churchId = req.user.churchId?._id || req.user.churchId;
const flagged = await Member.find({ isFlagged: true, churchId }).sort({ fullName: 1 });    res.json(flagged);
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
    const churchId = req.user.churchId?._id || req.user.churchId;
const totalMembers = await Member.countDocuments({ churchId });
const flaggedMembers = await Member.countDocuments({ isFlagged: true, churchId });
const lastAttendance = await Attendance.findOne({ churchId }).sort({ sundayDate: -1 });
const totalSundays = await Attendance.countDocuments({ churchId });
    res.json({
      totalMembers, flaggedMembers,
      lastAttendanceTotal: lastAttendance ? lastAttendance.stats.total : 0,
      lastAttendanceDate: lastAttendance ? lastAttendance.sundayDate : null,
      totalSundays
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
// Absentees route
router.get('/absentees/:attendanceId', protect, adminOnly, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.attendanceId)
      .populate('memberAttendance.member', 'fullName memberId gender membershipType phoneNumber');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const allMembers = await Member.find()
    const recordedIds = record.memberAttendance
      .map(a => (a.member?._id || a.member).toString())

    const absentees = []

    record.memberAttendance
      .filter(a => a.status === 'Absent')
      .forEach(a => {
        absentees.push({
          _id: a.member?._id,
          fullName: a.member?.fullName,
          memberId: a.member?.memberId,
          gender: a.member?.gender,
          membershipType: a.member?.membershipType,
          phoneNumber: a.member?.phoneNumber,
          reason: 'Marked Absent'
        })
      })

    allMembers.forEach(m => {
      if (!recordedIds.includes(m._id.toString())) {
        absentees.push({
          _id: m._id,
          fullName: m.fullName,
          memberId: m.memberId,
          gender: m.gender,
          membershipType: m.membershipType,
          phoneNumber: m.phoneNumber,
          reason: 'Not Recorded'
        })
      }
    })

    res.json({ sundayDate: record.sundayDate, absentees })
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Annual report route
router.get('/annual/:year', protect, adminOnly, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);
    const records = await Attendance.find({
      sundayDate: { $gte: startDate, $lte: endDate }
    }).sort({ sundayDate: 1 });

    if (records.length === 0) {
      return res.json({ year, message: 'No records found', records: [] });
    }

    const totals = records.map(r => r.stats?.total || 0);
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    const average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const highestRecord = records.find(r => r.stats?.total === highest);
    const lowestRecord = records.find(r => r.stats?.total === lowest);

    res.json({
      year, totalSundays: records.length,
      highest: { total: highest, date: highestRecord?.sundayDate },
      lowest: { total: lowest, date: lowestRecord?.sundayDate },
      average,
      records: records.map(r => ({
        _id: r._id,
        sundayDate: r.sundayDate,
        total: r.stats?.total || 0,
        males: r.stats?.males || 0,
        females: r.stats?.females || 0
      }))
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
module.exports = router;