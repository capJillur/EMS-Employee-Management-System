const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/stats', protect, authorize('super_admin', 'hr_manager'), getStats);

module.exports = router;
