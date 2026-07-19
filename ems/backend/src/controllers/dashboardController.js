const Employee = require('../models/Employee');

// @desc    Get dashboard summary stats and chart data
// @route   GET /api/dashboard/stats
// @access  Private (super_admin, hr_manager)
const getStats = async (req, res, next) => {
  try {
    const [total, active, inactive, byDepartment, byRole, byJoinYear] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: 'active' }),
      Employee.countDocuments({ status: 'inactive' }),
      Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Employee.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Employee.aggregate([
        { $group: { _id: { $year: '$joiningDate' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const departmentCount = byDepartment.length;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: total,
        activeEmployees: active,
        inactiveEmployees: inactive,
        departmentCount,
        charts: {
          byDepartment: byDepartment.map((d) => ({ department: d._id || 'Unassigned', count: d.count })),
          byRole: byRole.map((r) => ({ role: r._id, count: r.count })),
          byJoinYear: byJoinYear.map((y) => ({ year: y._id, count: y.count })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
