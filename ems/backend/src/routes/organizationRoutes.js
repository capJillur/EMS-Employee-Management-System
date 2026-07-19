const express = require('express');
const { getOrgTree } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/tree', protect, authorize('super_admin', 'hr_manager'), getOrgTree);

module.exports = router;
