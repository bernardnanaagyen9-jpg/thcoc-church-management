const express = require('express');
const router = express.Router();
const Church = require('../models/Church');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const churches = await Church.find().sort({ createdAt: -1 });
    res.json(churches);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/register', async (req, res) => {
  try {
    const { churchName, churchCode, location, denomination, phone, churchEmail, adminName, adminEmail, adminPassword } = req.body;
    if (!churchName || !churchCode || !adminName || !adminEmail || !adminPassword)
      return res.status(400).json({ message: 'Please provide all required fields' });

    const codeExists = await Church.findOne({ code: churchCode.toUpperCase() });
    if (codeExists) return res.status(400).json({ message: 'Church code already taken. Choose another.' });

    const emailExists = await User.findOne({ email: adminEmail });
    if (emailExists) return res.status(400).json({ message: 'Email already registered' });

    const church = await Church.create({
      name: churchName,
      code: churchCode.toUpperCase(),
      location,
      denomination,
      phone,
      email: churchEmail
    });

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      churchId: church._id
    });

    church.createdBy = admin._id;
    await church.save();

    res.status(201).json({
      message: 'Church registered successfully',
      church: { _id: church._id, name: church.name, code: church.code },
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        churchId: church._id,
        churchName: church.name,
        token: generateToken(admin._id)
      }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/check-code/:code', async (req, res) => {
  try {
    const church = await Church.findOne({ code: req.params.code.toUpperCase() });
    res.json({ available: !church, church: church ? { name: church.name } : null });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/my-church', protect, async (req, res) => {
  try {
    const church = await Church.findById(req.user.churchId);
    if (!church) return res.status(404).json({ message: 'Church not found' });
    res.json(church);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const church = await Church.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!church) return res.status(404).json({ message: 'Church not found' });
    res.json(church);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;