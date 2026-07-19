# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except `/auth/login` and `/health` require a JWT, sent either as an httpOnly cookie
(set automatically on login) or as a header: `Authorization: Bearer <token>`.

Responses are JSON. Successful responses include `"success": true`; errors include
`"success": false` and a `message` (and sometimes a `errors` array of field-level validation
issues).

---

## Auth

### POST /auth/login
Public. Body: `{ "email": string, "password": string }`
Returns: `{ success, token, user }`

### POST /auth/logout
Private. Clears the auth cookie.

### GET /auth/me
Private. Returns the current user's profile.

---

## Employees

### GET /employees
Private — **Super Admin, HR Manager only**.

Query params (all optional):
| Param | Type | Description |
|---|---|---|
| `page` | number | default 1 |
| `limit` | number | default 10, max 100 |
| `search` | string | matches name, email, or employee ID |
| `department` | string | exact match |
| `role` | `super_admin` \| `hr_manager` \| `employee` | |
| `status` | `active` \| `inactive` | |
| `sortBy` | `name` \| `joiningDate` \| `createdAt` | default `createdAt` |
| `sortOrder` | `asc` \| `desc` | default `desc` |
| `includeDeleted` | `true` | Super Admin only — show soft-deleted employees |

Returns: `{ success, count, total, page, pages, data: Employee[] }`

### POST /employees
Private — **Super Admin, HR Manager only**. HR Managers cannot set `role: "super_admin"`.

Body (JSON):
```json
{
  "employeeId": "EMP-0011",
  "name": "Jane Doe",
  "email": "jane@company.com",
  "phone": "+1-555-0110",
  "password": "Welcome@123",
  "department": "Engineering",
  "designation": "Software Engineer",
  "salary": 90000,
  "joiningDate": "2024-01-15",
  "status": "active",
  "role": "employee",
  "reportingManager": "<employeeObjectId or null>"
}
```

### GET /employees/:id
Private. Super Admin / HR Manager can view anyone. An `employee` role user may only view their own
record (`403` otherwise).

### PUT /employees/:id
Private. Update rules:
- Super Admin: full access to any field on any employee.
- HR Manager: can edit anyone except Super Admins; cannot assign the `super_admin` role.
- Employee: can only update their own record, and only these fields: `name`, `phone`,
  `profileImage`, `password`.

Assigning `reportingManager` here runs the same circular-reporting check as the dedicated
`PATCH /employees/:id/manager` endpoint.

### DELETE /employees/:id
Private — **Super Admin only**. Soft-deletes the employee (`isDeleted: true`, `status: inactive`)
and re-parents their direct reports to their own manager.

### PATCH /employees/:id/restore
Private — **Super Admin only**. Restores a soft-deleted employee.

### PATCH /employees/:id/manager
Private — **Super Admin, HR Manager**. Body: `{ "managerId": "<employeeObjectId>" | null }`.
Rejects assignments that would create a circular reporting relationship or self-reporting.

### GET /employees/:id/reportees
Private. Returns the employee's direct reports (`Employee[]`).

### POST /employees/import
Private — **Super Admin, HR Manager**. `multipart/form-data` with a `file` field containing a CSV.

CSV headers: `employeeId,name,email,phone,password,department,designation,salary,joiningDate,status,role`
(`password`, `status`, `role` optional).

Returns: `{ success, message, created: string[], failed: [{ row, error }] }`. Each row is validated
and created independently — one bad row doesn't stop the rest of the import.

---

## Organization

### GET /organization/tree
Private — **Super Admin, HR Manager only**. Returns a nested reporting tree:

```json
[
  {
    "_id": "...",
    "name": "Ava Rahman",
    "employeeId": "EMP-0001",
    "directReports": [ { "...": "...", "directReports": [] } ]
  }
]
```

---

## Dashboard

### GET /dashboard/stats
Private — **Super Admin, HR Manager only**.

Returns:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 10,
    "activeEmployees": 9,
    "inactiveEmployees": 1,
    "departmentCount": 6,
    "charts": {
      "byDepartment": [{ "department": "Engineering", "count": 3 }],
      "byRole": [{ "role": "employee", "count": 8 }],
      "byJoinYear": [{ "year": 2022, "count": 3 }]
    }
  }
}
```

---

## Error format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

## Status codes

 Code Meaning 

 200  OK 
 201  Created 
 400  Validation error / bad request 
 401  Missing or invalid token 
 403  Authenticated but not permitted (RBAC) 
 404  Not found 
 409  Duplicate key (e.g. email already exists) 
 500  Server error 
