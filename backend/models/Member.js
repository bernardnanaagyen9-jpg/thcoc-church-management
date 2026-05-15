const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female', ''] },
  birthDate: { type: String, trim: true }
});

const memberSchema = new mongoose.Schema({
  // Auto ID
  memberId: { type: String, unique: true },

  // PERSONAL
  fullName: { type: String, required: true, trim: true },
  birthday: { type: String, trim: true },
  age: { type: Number },
  address: { type: String, trim: true },
  gpsCode: { type: String, trim: true },
  placeOfBirth: { type: String, trim: true },
  townOfResidence: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Widow'], required: true },
  occupation: { type: String, trim: true },
  residentialAddress: { type: String, trim: true },

  // FAMILY
  spouseName: { type: String, trim: true },
  spouseMobile: { type: String, trim: true },
  numberOfChildren: { type: Number, default: 0 },
  children: [childSchema],
  motherName: { type: String, trim: true },
  motherStatus: { type: String, enum: ['Alive', 'Dead', ''], default: '' },
  motherMobile: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  fatherStatus: { type: String, enum: ['Alive', 'Dead', ''], default: '' },
  fatherMobile: { type: String, trim: true },
  familyType: { type: String, trim: true },
  familyHead: { type: String, trim: true, default: '' },
  familyHeadContact: { type: String, trim: true, default: '' },
  emergencyContactName: { type: String, trim: true },
  emergencyContactMobile: { type: String, trim: true },

  // CHURCH
  dateOfBaptism: { type: String, trim: true },
  placeOfBaptism: { type: String, trim: true },
  membershipType: { type: String, enum: ['Full Member', 'New Convert', 'Visitor'], required: true },
  dateJoined: { type: String, trim: true },

  // SYSTEM
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
    } catch (err) { return next(err) }
  }
  next()
});

module.exports = mongoose.model('Member', memberSchema);