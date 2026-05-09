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
  isFlagged: { membertype: Boolean, default: false },
  joinDate: { type: Date, default: Date.now }
  photo: {
  url: { type: String, default: '' },
  publicId: { type: String, default: '' }
},
}, { timestamps: true });

memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    let isUnique = false;
    let num;
    while (!isUnique) {
      const count = await mongoose.model('Member').countDocuments();
      const lastMember = await mongoose.model('Member').findOne().sort({ createdAt: -1 });
      let nextNum = count + 1;
      if (lastMember && lastMember.memberId) {
        const lastNum = parseInt(lastMember.memberId.replace('THCoC-', ''));
        nextNum = lastNum + 1;
      }
      num = String(nextNum).padStart(6, '0');
      const existing = await mongoose.model('Member').findOne({ memberId: `THCoC-${num}` });
      if (!existing) isUnique = true;
      else nextNum++;
    }
    this.memberId = `THCoC-${num}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);