const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protect, adminOnly } = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary');

router.get('/', protect, async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType, familyHead, familyHeadContact } = req.body;
    if (!fullName || !gender || !maritalStatus || !membershipType)
      return res.status(400).json({ message: 'Full name, gender, marital status and membership type are required' });
    const member = await Member.create({ 
      fullName, phoneNumber, email, residentialAddress, 
      occupation, gender, maritalStatus, membershipType,
      familyHead: familyHead || '',
      familyHeadContact: familyHeadContact || ''
    });
    res.status(201).json(member);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType, familyHead, familyHeadContact } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    member.fullName = fullName || member.fullName;
    member.phoneNumber = phoneNumber || member.phoneNumber;
    member.email = email || member.email;
    member.residentialAddress = residentialAddress || member.residentialAddress;
    member.occupation = occupation || member.occupation;
    member.gender = gender || member.gender;
    member.maritalStatus = maritalStatus || member.maritalStatus;
    member.membershipType = membershipType || member.membershipType;
    member.familyHead = familyHead !== undefined ? familyHead : member.familyHead;
    member.familyHeadContact = familyHeadContact !== undefined ? familyHeadContact : member.familyHeadContact;
    
    await member.save();
    res.json(member);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.photo?.publicId) {
      await cloudinary.uploader.destroy(member.photo.publicId);
    }
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/:id/photo', protect, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.photo?.publicId) {
      await cloudinary.uploader.destroy(member.photo.publicId);
    }
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'thcoc-members', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      )
      stream.end(req.file.buffer)
    })
    member.photo = { url: result.secure_url, publicId: result.public_id };
    await member.save();
    res.json({ message: 'Photo uploaded successfully', photo: member.photo });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:id/photo', protect, adminOnly, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.photo?.publicId) {
      await cloudinary.uploader.destroy(member.photo.publicId);
    }
    member.photo = { url: '', publicId: '' };
    await member.save();
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;