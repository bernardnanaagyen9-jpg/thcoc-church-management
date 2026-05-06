const mongoose = require('mongoose');

const thanksgivingEntrySchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  totalNumber: { type: Number, required: true, min: 0 }
});

const thanksgivingSchema = new mongoose.Schema({
  sundayDate: { type: Date, required: true },
  entries: [thanksgivingEntrySchema],
  totalAttendance: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

thanksgivingSchema.pre('save', function(next) {
  this.totalAttendance = this.entries.reduce((sum, e) => sum + (e.totalNumber || 0), 0);
  next();
});

module.exports = mongoose.model('Thanksgiving', thanksgivingSchema);