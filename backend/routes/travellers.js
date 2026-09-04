const express = require('express');
const router = express.Router();
const Traveller = require('../models/Traveller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const churchId = req.user.churchId && req.user.churchId._id ? req.user.churchId._id : req.user.churchId;
    const travellers = await Traveller.find({ churchId }).sort({ createdAt: -1 });
    res.json(travellers);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType, familyHead, familyHeadContact } = req.body;
    if (!fullName || !gender)
      return res.status(400).json({ message: 'Full name and gender are required' });
    const churchId = req.user.churchId && req.user.churchId._id ? req.user.churchId._id : req.user.churchId;
    const traveller = await Traveller.create({
      fullName, phoneNumber, email, residentialAddress,
      occupation, gender, maritalStatus, membershipType,
      familyHead: familyHead || '',
      familyHeadContact: familyHeadContact || '',
      churchId,
      addedBy: req.user._id
    });
    res.status(201).json(traveller);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType, familyHead, familyHeadContact } = req.body;
    const traveller = await Traveller.findById(req.params.id);
    if (!traveller) return res.status(404).json({ message: 'Traveller not found' });
    traveller.fullName = fullName || traveller.fullName;
    traveller.phoneNumber = phoneNumber || traveller.phoneNumber;
    traveller.email = email || traveller.email;
    traveller.residentialAddress = residentialAddress || traveller.residentialAddress;
    traveller.occupation = occupation || traveller.occupation;
    traveller.gender = gender || traveller.gender;
    traveller.maritalStatus = maritalStatus || traveller.maritalStatus;
    traveller.membershipType = membershipType || traveller.membershipType;
    traveller.familyHead = familyHead !== undefined ? familyHead : traveller.familyHead;
    traveller.familyHeadContact = familyHeadContact !== undefined ? familyHeadContact : traveller.familyHeadContact;
    await traveller.save();
    res.json(traveller);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const traveller = await Traveller.findByIdAndDelete(req.params.id);
    if (!traveller) return res.status(404).json({ message: 'Traveller not found' });
    res.json({ message: 'Traveller deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;