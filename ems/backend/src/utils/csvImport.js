const { parse } = require('csv-parse/sync');

/**
 * Expected CSV headers (case-insensitive):
 * employeeId,name,email,phone,password,department,designation,salary,joiningDate,status,role
 */
const parseEmployeeCsv = (buffer) => {
  const records = parse(buffer, {
    columns: (header) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row) => ({
    employeeId: row.employeeId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password || 'Welcome@123',
    department: row.department,
    designation: row.designation,
    salary: row.salary ? Number(row.salary) : undefined,
    joiningDate: row.joiningDate ? new Date(row.joiningDate) : undefined,
    status: row.status || 'active',
    role: row.role || 'employee',
  }));
};

module.exports = { parseEmployeeCsv };
