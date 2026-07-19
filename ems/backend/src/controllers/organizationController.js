const Employee = require('../models/Employee');

// @desc    Get full organizational reporting tree
// @route   GET /api/organization/tree
// @access  Private (super_admin, hr_manager)
const getOrgTree = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).select('name employeeId email designation department role status reportingManager profileImage').lean();

    const byId = new Map(employees.map((e) => [String(e._id), { ...e, directReports: [] }]));
    const roots = [];

    byId.forEach((emp) => {
      if (emp.reportingManager && byId.has(String(emp.reportingManager))) {
        byId.get(String(emp.reportingManager)).directReports.push(emp);
      } else {
        roots.push(emp);
      }
    });

    res.status(200).json({ success: true, data: roots });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrgTree };
