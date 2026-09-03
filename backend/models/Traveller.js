const mongoose = require('mongoose');

const travellerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  residentialAddress: { type: String, trim: true },
  occupation: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Widow'] },
  membershipType: { type: String, enum: ['Full Member', 'New Convert', 'Visitor'], default: 'Visitor' },
  familyHead: { type: String, trim: true, default: '' },
  familyHeadContact: { type: String, trim: true, default: '' },
  churchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Church' },
  visitDate: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Traveller', travellerSchema);