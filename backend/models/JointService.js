const mongoose = require('mongoose');

const congregationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  totalAttendance: { type: Number, required: true, min: 0 }
});

const jointServiceSchema = new mongoose.Schema({
  serviceDate: { type: Date, required: true },
  churchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Church' },
  title: { type: String, trim: true },
  congregations: [congregationSchema],
  grandTotal: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

jointServiceSchema.pre('save', function(next) {
  this.grandTotal = this.congregations.reduce((sum, c) => sum + (c.totalAttendance || 0), 0);
  next();
});

module.exports = mongoose.model('JointService', jointServiceSchema);