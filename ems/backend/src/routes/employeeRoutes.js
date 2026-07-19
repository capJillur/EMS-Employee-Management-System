const express = require('express');
const multer = require('multer');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  assignManager,
  getReportees,
  importEmployees,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  createEmployeeRules,
  updateEmployeeRules,
  listQueryRules,
  mongoIdParam,
} = require('../validators/employeeValidator');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('super_admin', 'hr_manager'), listQueryRules, validate, getEmployees)
  .post(authorize('super_admin', 'hr_manager'), createEmployeeRules, validate, createEmployee);

router.post('/import', authorize('super_admin', 'hr_manager'), upload.single('file'), importEmployees);

router
  .route('/:id')
  .get(mongoIdParam(), validate, getEmployee)
  .put(mongoIdParam(), updateEmployeeRules, validate, updateEmployee)
  .delete(authorize('super_admin'), mongoIdParam(), validate, deleteEmployee);

router.patch('/:id/restore', authorize('super_admin'), mongoIdParam(), validate, restoreEmployee);
router.patch('/:id/manager', authorize('super_admin', 'hr_manager'), mongoIdParam(), validate, assignManager);
router.get('/:id/reportees', mongoIdParam(), validate, getReportees);

module.exports = router;
