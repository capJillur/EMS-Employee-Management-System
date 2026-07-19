# Employee Management System (EMS)

A full-stack Employee Management System built for the Full Stack Developer hiring assignment.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt, role-based access control (Super Admin / HR Manager / Employee)

## Features

- Login / logout with JWT, protected routes, bcrypt password hashing
- Role-based access control (Super Admin, HR Manager, Employee) enforced on both the API and the UI
- Employee CRUD with all required fields (ID, name, email, phone, department, designation, salary,
  joining date, status, role, reporting manager, profile image)
- Organizational hierarchy: assign/change reporting manager, circular-reporting prevention, direct
  reports view, full interactive reporting tree
- Dashboard: total / active / inactive employees, department count, plus charts (department
  distribution, role distribution, joining trend by year)
- Search (name/email), filter (department, role, status), sort (name, joining date), pagination
- Frontend + backend validation (email, phone, salary, required fields)
- **Bonus features included:** pagination, soft delete (with automatic re-parenting of direct
  reports), CSV bulk import, dashboard charts, dark mode

## Project structure

```
ems/
├── backend/     Express + MongoDB API
└── frontend/    Next.js + TypeScript + Tailwind UI
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas, or a local `mongod` instance)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set `MONGO_URI` to your MongoDB Atlas connection string (or a local URI like
`mongodb://localhost:27017/ems`). Also set a real `JWT_SECRET`.

Seed the database with a Super Admin, an HR Manager, and several employees in a realistic reporting
hierarchy:

```bash
npm run seed
```

This prints the demo login credentials to the console (also listed below). Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. Check `http://localhost:5000/api/health`.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The app runs on `http://localhost:3000`. It talks to the API at the URL in
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`).

> **Note on auth:** because the frontend (port 3000) and backend (port 5000) are different origins,
> the app stores the JWT in `localStorage` and attaches it as a `Bearer` token on every API request
> (in addition to the httpOnly cookie the API also sets). This is simpler and more reliable across
> origins than relying on cross-origin cookies in Next.js middleware.

## Demo accounts (created by `npm run seed`)

| Role        | Email                    | Password      |
|-------------|---------------------------|---------------|
| Super Admin | admin@ems.com              | Admin@12345   |
| HR Manager  | hr.daniel@ems.com          | Hr@12345      |
| Employee    | sofia.nguyen@ems.com       | Welcome@123   |

All other seeded employees also use the password `Welcome@123`.

## Role permissions

| Action                          | Super Admin | HR Manager | Employee            |
|----------------------------------|:-----------:|:----------:|:--------------------:|
| View employee directory          | ✅          | ✅         | ❌ (own profile only)|
| Create / edit employees          | ✅          | ✅ (can't touch Super Admins) | ❌ |
| Delete (soft) employees          | ✅          | ❌         | ❌                    |
| Assign roles / managers          | ✅          | ✅ (can't assign Super Admin) | ❌ |
| Edit own profile (limited fields)| ✅          | ✅         | ✅ (name, phone, photo, password) |
| View dashboard & org chart       | ✅          | ✅         | ❌                    |

## CSV import format

`POST /api/employees/import` (multipart form, field name `file`) expects a CSV with headers:

```
employeeId,name,email,phone,password,department,designation,salary,joiningDate,status,role
```

`password`, `status`, and `role` are optional — they default to `Welcome@123`, `active`, and
`employee` respectively.

## Running in production

- Backend: `npm start` (after `npm install`, with a production `.env`)
- Frontend: `npm run build && npm start`

Set `CLIENT_URL` in the backend `.env` to your deployed frontend origin (for CORS), and
`NEXT_PUBLIC_API_URL` in the frontend to your deployed API URL.

## Tech notes

- Employees soft-delete: `DELETE /api/employees/:id` sets `isDeleted: true` / `status: inactive`
  rather than removing the document, and any direct reports are automatically re-parented to the
  deleted employee's own manager so the hierarchy stays valid.
- Circular reporting is prevented by walking the proposed manager's chain up to the root before
  saving a `reportingManager` change.
- See `API_DOCUMENTATION.md` for the full endpoint reference.
