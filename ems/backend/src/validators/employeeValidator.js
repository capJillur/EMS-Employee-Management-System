const { body, query, param } = require('express-validator');
const Employee = require('../models/Employee');

const createEmployeeRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Invalid phone number format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('salary').notEmpty().withMessage('Salary is required').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').notEmpty().withMessage('Joining date is required').isISO8601().withMessage('Joining date must be a valid date'),
  body('role').optional().isIn(Employee.ROLES).withMessage('Invalid role'),
  body('status').optional().isIn(Employee.STATUSES).withMessage('Invalid status'),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid reporting manager id'),
];

const updateEmployeeRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().withMessage('Invalid email format'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Invalid phone number format'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().withMessage('Joining date must be a valid date'),
  body('role').optional().isIn(Employee.ROLES).withMessage('Invalid role'),
  body('status').optional().isIn(Employee.STATUSES).withMessage('Invalid status'),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid reporting manager id'),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'joiningDate', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('status').optional().isIn(Employee.STATUSES),
];

const mongoIdParam = (name = 'id') => [param(name).isMongoId().withMessage(`Invalid ${name}`)];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  createEmployeeRules,
  updateEmployeeRules,
  listQueryRules,
  mongoIdParam,
  loginRules,
};
