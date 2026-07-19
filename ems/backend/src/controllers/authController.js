const Employee = require('../models/Employee');
const { generateToken, cookieOptions } = require('../utils/generateToken');

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact your admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, cookieOptions());

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout employee
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await Employee.findById(req.user._id).populate('reportingManager', 'name employeeId designation');
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, getMe };
