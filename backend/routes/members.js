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
    const { fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType } = req.body;
    if (!fullName || !gender || !maritalStatus || !membershipType)
      return res.status(400).json({ message: 'Full name, gender, marital status and membership type are required' });
    const member = await Member.create({ fullName, phoneNumber, email, residentialAddress, occupation, gender, maritalStatus, membershipType });
    res.status(201).json(member);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
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

// Upload member photo
router.post('/:id/photo', protect, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Delete old photo if exists
    if (member.photo?.publicId) {
      await cloudinary.uploader.destroy(member.photo.publicId);
    }

    member.photo = {
      url: req.file.path,
      publicId: req.file.filename
    };
    await member.save();
    res.json({ message: 'Photo uploaded successfully', photo: member.photo });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Delete member photo
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