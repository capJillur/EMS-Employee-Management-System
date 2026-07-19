const express = require('express');
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginRules } = require('../validators/employeeValidator');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
