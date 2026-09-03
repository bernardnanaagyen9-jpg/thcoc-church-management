const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Church = require('../models/Church');
const { protect, generateToken } = require('../middleware/auth');

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, churchCode } = req.body;
    if (!name || !email || !password || !churchCode)
      return res.status(400).json({ message: 'Please provide all fields including church code' });

    const church = await Church.findOne({ code: churchCode.toUpperCase() });
    if (!church) return res.status(400).json({ message: 'Invalid church code. Contact your church admin.' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'user', churchId: church._id });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, churchId: church._id, churchName: church.name,
      token: generateToken(user._id)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).populate('churchId');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (role && role !== 'superadmin' && user.role !== role)
      return res.status(401).json({ message: `No ${role} account found with this email` });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      churchId: user.churchId?._id || null,
      churchName: user.churchId?.name || null,
      token: generateToken(user._id)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// @PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/me', protect, async (req, res) => { res.json(req.user); });

router.get('/check-admin', async (req, res) => {
  const adminExists = await User.findOne({ role: 'admin' });
  res.json({ exists: !!adminExists });
});

module.exports = router;