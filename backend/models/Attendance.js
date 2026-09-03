const mongoose = require('mongoose');

const memberAttendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  membershipType: { type: String, enum: ['Full Member', 'New Convert', 'Visitor'] }
});

const travellerAttendanceSchema = new mongoose.Schema({
  traveller: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveller', required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
});

const attendanceSchema = new mongoose.Schema({
 sundayDate: { type: Date, required: true },
churchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Church', required: true },
  memberAttendance: [memberAttendanceSchema],
  travellerAttendance: [travellerAttendanceSchema],
  intermediateClass: { type: Number, default: 0, min: 0 },
  childrenService: { type: Number, default: 0, min: 0 },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stats: {
    males: { type: Number, default: 0 },
    females: { type: Number, default: 0 },
    visitors: { type: Number, default: 0 },
    travellers: { type: Number, default: 0 },
    intermediate: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
}, { timestamps: true });

attendanceSchema.pre('save', function(next) {
  let males = 0, females = 0, visitors = 0;
  this.memberAttendance.forEach(a => {
    if (a.status === 'Present') {
      if (a.gender === 'Male') males++;
      else if (a.gender === 'Female') females++;
      if (a.membershipType === 'Visitor') visitors++;
    }
  });
  const travellers = this.travellerAttendance.filter(t => t.status === 'Present').length;
  this.stats = {
    males, females, visitors, travellers,
    intermediate: this.intermediateClass || 0,
    children: this.childrenService || 0,
    total: males + females + (this.intermediateClass || 0) + (this.childrenService || 0) + travellers
  };
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);