require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Employee = require('../models/Employee');

const run = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Employee.deleteMany({});
    console.log('All employee data destroyed.');
    return mongoose.connection.close();
  }

  const existing = await Employee.countDocuments({});
  if (existing > 0) {
    console.log(`Database already has ${existing} employees. Skipping seed. Run "npm run seed:destroy" first to reset.`);
    return mongoose.connection.close();
  }

  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@ems.com';
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin@12345';

  const superAdmin = await Employee.create({
    employeeId: 'EMP-0001',
    name: 'Ava Rahman',
    email: adminEmail,
    phone: '+1-555-0100',
    password: adminPassword,
    department: 'Executive',
    designation: 'Chief Executive Officer',
    salary: 250000,
    joiningDate: new Date('2019-01-15'),
    status: 'active',
    role: 'super_admin',
  });

  const hr1 = await Employee.create({
    employeeId: 'EMP-0002',
    name: 'Daniel Cho',
    email: 'hr.daniel@ems.com',
    phone: '+1-555-0101',
    password: 'Hr@12345',
    department: 'Human Resources',
    designation: 'HR Manager',
    salary: 95000,
    joiningDate: new Date('2020-03-10'),
    status: 'active',
    role: 'hr_manager',
    reportingManager: superAdmin._id,
  });

  const engManager = await Employee.create({
    employeeId: 'EMP-0003',
    name: 'Priya Sharma',
    email: 'priya.sharma@ems.com',
    phone: '+1-555-0102',
    password: 'Manager@123',
    department: 'Engineering',
    designation: 'Engineering Manager',
    salary: 140000,
    joiningDate: new Date('2020-06-01'),
    status: 'active',
    role: 'employee',
    reportingManager: superAdmin._id,
  });

  const salesManager = await Employee.create({
    employeeId: 'EMP-0004',
    name: 'Marcus Lee',
    email: 'marcus.lee@ems.com',
    phone: '+1-555-0103',
    password: 'Manager@123',
    department: 'Sales',
    designation: 'Sales Manager',
    salary: 120000,
    joiningDate: new Date('2021-02-18'),
    status: 'active',
    role: 'employee',
    reportingManager: superAdmin._id,
  });

  const teamMembers = [
    {
      employeeId: 'EMP-0005',
      name: 'Sofia Nguyen',
      email: 'sofia.nguyen@ems.com',
      phone: '+1-555-0104',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      salary: 115000,
      joiningDate: new Date('2021-07-12'),
      reportingManager: engManager._id,
    },
    {
      employeeId: 'EMP-0006',
      name: 'James O\u2019Connor',
      email: 'james.oconnor@ems.com',
      phone: '+1-555-0105',
      department: 'Engineering',
      designation: 'Software Engineer',
      salary: 95000,
      joiningDate: new Date('2022-01-20'),
      reportingManager: engManager._id,
    },
    {
      employeeId: 'EMP-0007',
      name: 'Layla Haddad',
      email: 'layla.haddad@ems.com',
      phone: '+1-555-0106',
      department: 'Engineering',
      designation: 'QA Engineer',
      salary: 85000,
      joiningDate: new Date('2022-09-05'),
      status: 'inactive',
      reportingManager: engManager._id,
    },
    {
      employeeId: 'EMP-0008',
      name: 'Noah Kim',
      email: 'noah.kim@ems.com',
      phone: '+1-555-0107',
      department: 'Sales',
      designation: 'Account Executive',
      salary: 78000,
      joiningDate: new Date('2022-04-11'),
      reportingManager: salesManager._id,
    },
    {
      employeeId: 'EMP-0009',
      name: 'Grace Okafor',
      email: 'grace.okafor@ems.com',
      phone: '+1-555-0108',
      department: 'Marketing',
      designation: 'Marketing Specialist',
      salary: 72000,
      joiningDate: new Date('2023-05-22'),
      reportingManager: hr1._id,
    },
    {
      employeeId: 'EMP-0010',
      name: 'Ethan Brooks',
      email: 'ethan.brooks@ems.com',
      phone: '+1-555-0109',
      department: 'Finance',
      designation: 'Financial Analyst',
      salary: 88000,
      joiningDate: new Date('2023-11-02'),
      reportingManager: hr1._id,
    },
  ];

  for (const member of teamMembers) {
    await Employee.create({
      ...member,
      password: 'Welcome@123',
      status: member.status || 'active',
      role: 'employee',
    });
  }

  console.log('Seed complete. Demo accounts:');
  console.log(`  Super Admin -> ${adminEmail} / ${adminPassword}`);
  console.log('  HR Manager  -> hr.daniel@ems.com / Hr@12345');
  console.log('  Employee    -> sofia.nguyen@ems.com / Welcome@123');
  console.log('  (all other seeded employees use password: Welcome@123)');

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
