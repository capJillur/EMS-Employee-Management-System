const Employee = require('../models/Employee');
const { parseEmployeeCsv } = require('../utils/csvImport');

// Fields an 'employee' role is allowed to change on their own profile
const SELF_EDITABLE_FIELDS = ['name', 'phone', 'profileImage', 'password'];

// @desc    Get all employees (search, filter, sort, paginate)
// @route   GET /api/employees
// @access  Private (super_admin, hr_manager)
const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { employeeId: regex }];
    }
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.includeDeleted === 'true' && req.user.role === 'super_admin') {
      filter.isDeleted = true;
    }

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('reportingManager', 'name employeeId designation')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: employees.map((e) => e.toSafeObject()),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (super_admin, hr_manager, or self)
const getEmployee = async (req, res, next) => {
  try {
    if (req.user.role === 'employee' && String(req.user._id) !== req.params.id) {
      return res.status(403).json({ success: false, message: 'You can only view your own profile' });
    }

    const employee = await Employee.findById(req.params.id).populate('reportingManager', 'name employeeId designation');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (super_admin, hr_manager)
const createEmployee = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // HR cannot create Super Admins
    if (req.user.role === 'hr_manager' && payload.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'HR Managers cannot assign the Super Admin role' });
    }

    if (payload.reportingManager) {
      const manager = await Employee.findById(payload.reportingManager);
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Reporting manager not found' });
      }
    }

    const employee = await Employee.create(payload);
    res.status(201).json({ success: true, data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (super_admin, hr_manager, or self with restricted fields)
const updateEmployee = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isSelf = String(req.user._id) === targetId;

    if (req.user.role === 'employee' && !isSelf) {
      return res.status(403).json({ success: false, message: 'You can only edit your own profile' });
    }

    let updates = { ...req.body };

    // Employees may only touch a limited field set on themselves
    if (req.user.role === 'employee') {
      updates = Object.fromEntries(Object.entries(updates).filter(([key]) => SELF_EDITABLE_FIELDS.includes(key)));
    }

    // HR cannot promote anyone to Super Admin, and cannot edit an existing Super Admin
    if (req.user.role === 'hr_manager') {
      if (updates.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'HR Managers cannot assign the Super Admin role' });
      }
      const target = await Employee.findById(targetId);
      if (target && target.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'HR Managers cannot edit a Super Admin account' });
      }
    }

    if (updates.reportingManager) {
      if (updates.reportingManager === targetId) {
        return res.status(400).json({ success: false, message: 'An employee cannot report to themselves' });
      }
      const wouldCreateCycle = await checkCircularReporting(targetId, updates.reportingManager);
      if (wouldCreateCycle) {
        return res.status(400).json({ success: false, message: 'This assignment would create a circular reporting relationship' });
      }
    }

    const employee = await Employee.findById(targetId).select('+password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    Object.entries(updates).forEach(([key, value]) => {
      employee[key] = value;
    });

    await employee.save();

    res.status(200).json({ success: true, data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Soft-delete employee
// @route   DELETE /api/employees/:id
// @access  Private (super_admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    if (String(employee._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Re-parent direct reports to this employee's own manager to keep the tree valid
    await Employee.updateMany({ reportingManager: employee._id }, { reportingManager: employee.reportingManager || null });

    employee.isDeleted = true;
    employee.deletedAt = new Date();
    employee.status = 'inactive';
    await employee.save();

    res.status(200).json({ success: true, message: 'Employee soft-deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Restore a soft-deleted employee
// @route   PATCH /api/employees/:id/restore
// @access  Private (super_admin only)
const restoreEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: true, includeDeleted: true });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Deleted employee not found' });
    }
    employee.isDeleted = false;
    employee.deletedAt = null;
    await employee.save();
    res.status(200).json({ success: true, data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign / change reporting manager
// @route   PATCH /api/employees/:id/manager
// @access  Private (super_admin, hr_manager)
const assignManager = async (req, res, next) => {
  try {
    const { managerId } = req.body;
    const targetId = req.params.id;

    if (managerId) {
      if (managerId === targetId) {
        return res.status(400).json({ success: false, message: 'An employee cannot report to themselves' });
      }
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Reporting manager not found' });
      }
      const wouldCreateCycle = await checkCircularReporting(targetId, managerId);
      if (wouldCreateCycle) {
        return res.status(400).json({ success: false, message: 'This assignment would create a circular reporting relationship' });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      targetId,
      { reportingManager: managerId || null },
      { new: true, runValidators: true }
    ).populate('reportingManager', 'name employeeId designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Get direct reports of an employee
// @route   GET /api/employees/:id/reportees
// @access  Private
const getReportees = async (req, res, next) => {
  try {
    const reportees = await Employee.find({ reportingManager: req.params.id }).select('-password');
    res.status(200).json({ success: true, count: reportees.length, data: reportees });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import employees via CSV
// @route   POST /api/employees/import
// @access  Private (super_admin, hr_manager)
const importEmployees = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded (field name: file)' });
    }

    const rows = parseEmployeeCsv(req.file.buffer);
    const created = [];
    const failed = [];

    for (const row of rows) {
      try {
        if (req.user.role === 'hr_manager' && row.role === 'super_admin') {
          throw new Error('HR Managers cannot import Super Admin accounts');
        }
        const emp = await Employee.create(row);
        created.push(emp.employeeId);
      } catch (err) {
        failed.push({ row: row.email || row.employeeId || 'unknown', error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${created.length} created, ${failed.length} failed`,
      created,
      failed,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Walk up the management chain starting at proposedManagerId.
 * Returns true if employeeId is found anywhere in that chain (i.e. a cycle would form).
 */
async function checkCircularReporting(employeeId, proposedManagerId) {
  let currentId = proposedManagerId;
  const visited = new Set();

  while (currentId) {
    if (String(currentId) === String(employeeId)) return true;
    if (visited.has(String(currentId))) break; // already-corrupt chain, avoid infinite loop
    visited.add(String(currentId));

    const current = await Employee.findById(currentId).select('reportingManager');
    if (!current) break;
    currentId = current.reportingManager;
  }
  return false;
}

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  assignManager,
  getReportees,
  importEmployees,
};
