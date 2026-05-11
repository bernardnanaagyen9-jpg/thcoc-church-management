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
  familyHead: { type: String, trim: true, default: '' },
  familyHeadContact: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
  consecutiveAbsences: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now },
  photo: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  }
}, { timestamps: true });

memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    try {
      let isUnique = false
      let memberId
      while (!isUnique) {
        const lastMember = await mongoose.model('Member')
          .findOne({ memberId: { $regex: /^THCoC-\d+$/ } })
          .sort({ memberId: -1 })
        let nextNum = 1
        if (lastMember && lastMember.memberId) {
          const lastNum = parseInt(lastMember.memberId.replace('THCoC-', ''))
          nextNum = lastNum + 1
        }
        memberId = `THCoC-${String(nextNum).padStart(6, '0')}`
        const existing = await mongoose.model('Member').findOne({ memberId })
        if (!existing) isUnique = true
      }
      this.memberId = memberId
    } catch (err) {
      return next(err)
    }
  }
  next()
});

module.exports = mongoose.model('Member', memberSchema);