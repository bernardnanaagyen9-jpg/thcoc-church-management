const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  residentialAddress: { type: String, trim: true },
  occupation: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Widow'], required: true },
  membershipType: { type: String, enum: ['Full Member', 'New Convert', 'Visitor'], required: true },
  isActive: { type: Boolean, default: true },
  consecutiveAbsences: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member').countDocuments();
    const num = String(count + 1).padStart(6, '0');
    this.memberId = `THCoC-${num}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);