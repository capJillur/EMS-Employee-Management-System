export type Role = 'super_admin' | 'hr_manager' | 'employee';
export type Status = 'active' | 'inactive';

export interface ReportingManagerRef {
  _id: string;
  name: string;
  employeeId: string;
  designation: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager: ReportingManagerRef | string | null;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgNode extends Omit<Employee, 'reportingManager'> {
  reportingManager: string | null;
  directReports: OrgNode[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  charts: {
    byDepartment: { department: string; count: number }[];
    byRole: { role: string; count: number }[];
    byJoinYear: { year: number; count: number }[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}
