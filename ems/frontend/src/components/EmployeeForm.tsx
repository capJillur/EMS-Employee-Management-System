'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { Employee, Role, Status } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  employeeId: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager: string;
  profileImage: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  employeeId: '',
  department: '',
  designation: '',
  salary: '',
  joiningDate: '',
  status: 'active',
  role: 'employee',
  reportingManager: '',
  profileImage: '',
};

// Moved OUTSIDE the main component to prevent input focus loss on re-renders
const Field = ({ 
  name, 
  error, 
  children 
}: { 
  name: string; 
  error?: string; 
  children: React.ReactNode 
}) => (
  <div>
    {children}
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
);

export default function EmployeeForm({
  mode,
  employee,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  employee?: Employee;
  onSuccess: (employee: Employee) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSelf = Boolean(mode === 'edit' && employee && user && employee._id === user._id);
  const isHrViewer = user?.role === 'hr_manager';
  const isSuperAdminViewer = user?.role === 'super_admin';

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        password: '',
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        salary: String(employee.salary),
        joiningDate: employee.joiningDate?.slice(0, 10) || '',
        status: employee.status,
        role: employee.role,
        reportingManager:
          typeof employee.reportingManager === 'object' && employee.reportingManager
            ? employee.reportingManager._id
            : (employee.reportingManager as string) || '',
        profileImage: employee.profileImage || '',
      });
    }
  }, [employee]);

  useEffect(() => {
    // Super admins don't need the manager list when viewing their own profile
    if (isSelf && isSuperAdminViewer) return; 

    api
      .get('/employees', { params: { limit: 100, sortBy: 'name', sortOrder: 'asc' } })
      .then(({ data }) => setManagers(data.data.filter((m: Employee) => m._id !== employee?._id)))
      .catch(() => setManagers([]));
  }, [isSelf, isSuperAdminViewer, employee?._id]);

  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      let payload: Record<string, unknown>;

      // When editing one's own profile, only send the fields they are actually allowed to edit
      if (isSelf) {
        payload = { name: form.name, phone: form.phone, profileImage: form.profileImage };
        if (form.password) payload.password = form.password;
      } else {
        payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          designation: form.designation,
          salary: Number(form.salary),
          joiningDate: form.joiningDate,
          status: form.status,
          role: form.role,
          reportingManager: form.reportingManager || null,
          profileImage: form.profileImage,
        };
        if (mode === 'create') {
          payload.employeeId = form.employeeId;
          payload.password = form.password;
        } else if (form.password) {
          payload.password = form.password;
        }
      }

      const { data } =
        mode === 'create'
          ? await api.post('/employees', payload)
          : await api.put(`/employees/${employee!._id}`, payload);

      onSuccess(data.data);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { errors?: { field: string; message: string }[] } } };
      const errs = axiosErr.response?.data?.errors;
      if (errs) {
        setFieldErrors(Object.fromEntries(errs.map((e) => [e.field, e.message])));
      }
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-hover';
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="name" error={fieldErrors.name}>
          <label className={labelClass}>Full name</label>
          <input required className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>

        <Field name="email" error={fieldErrors.email}>
          <label className={labelClass}>Email</label>
          <input
            required
            type="email"
            disabled={isSelf} // Non-editable if viewing own profile
            className={inputClass}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field name="phone" error={fieldErrors.phone}>
          <label className={labelClass}>Phone</label>
          <input required className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>

        <Field name="password" error={fieldErrors.password}>
          <label className={labelClass}>
            {mode === 'create' ? 'Password' : 'New password (optional)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required={mode === 'create'}
              className={`${inputClass} pr-10`}
              placeholder={mode === 'edit' ? 'Leave blank to keep current password' : ''}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </Field>

        {mode === 'create' && (
          <Field name="employeeId" error={fieldErrors.employeeId}>
            <label className={labelClass}>Employee ID</label>
            <input
              required
              placeholder="EMP-0011"
              className={inputClass}
              value={form.employeeId}
              onChange={(e) => set('employeeId', e.target.value)}
            />
          </Field>
        )}

        <Field name="profileImage" error={fieldErrors.profileImage}>
          <label className={labelClass}>Profile image URL (optional)</label>
          <input className={inputClass} value={form.profileImage} onChange={(e) => set('profileImage', e.target.value)} />
        </Field>

        <Field name="department" error={fieldErrors.department}>
          <label className={labelClass}>Department</label>
          <input required disabled={isSelf} className={inputClass} value={form.department} onChange={(e) => set('department', e.target.value)} />
        </Field>

        <Field name="designation" error={fieldErrors.designation}>
          <label className={labelClass}>Designation</label>
          <input required disabled={isSelf} className={inputClass} value={form.designation} onChange={(e) => set('designation', e.target.value)} />
        </Field>

        {/* Removed for self-profiles entirely */}
        {!isSelf && (
          <Field name="salary" error={fieldErrors.salary}>
            <label className={labelClass}>Salary (annual)</label>
            <input
              required
              type="number"
              min={0}
              className={inputClass}
              value={form.salary}
              onChange={(e) => set('salary', e.target.value)}
            />
          </Field>
        )}

        <Field name="joiningDate" error={fieldErrors.joiningDate}>
          <label className={labelClass}>Joining date</label>
          <input
            required
            type="date"
            disabled={isSelf}
            className={inputClass}
            value={form.joiningDate}
            onChange={(e) => set('joiningDate', e.target.value)}
          />
        </Field>

        {/* Removed for self-profiles entirely */}
        {!isSelf && (
          <Field name="status" error={fieldErrors.status}>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        )}

        <Field name="role" error={fieldErrors.role}>
          <label className={labelClass}>Role</label>
          <select
            className={inputClass}
            value={form.role}
            disabled={isSelf || (isHrViewer && employee?.role === 'super_admin')}
            onChange={(e) => set('role', e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="hr_manager">HR Manager</option>
            {(!isHrViewer || form.role === 'super_admin') && <option value="super_admin">Super Admin</option>}
          </select>
          {isHrViewer && !isSelf && <p className="mt-1 text-xs text-muted">HR Managers can&rsquo;t assign the Super Admin role.</p>}
        </Field>

        {/* Hide reporting manager entirely for Super Admin looking at own profile */}
        {!(isSelf && isSuperAdminViewer) && (
          <Field name="reportingManager" error={fieldErrors.reportingManager}>
            <label className={labelClass}>Reporting manager</label>
            <select
              className={inputClass}
              value={form.reportingManager}
              disabled={isSelf} // Non-editable if viewing own profile (HR/Employee)
              onChange={(e) => set('reportingManager', e.target.value)}
            >
              <option value="">No manager (top of hierarchy)</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m.designation}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create employee' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}