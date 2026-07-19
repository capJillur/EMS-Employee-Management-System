'use client';

import Link from 'next/link';
import { Employee } from '@/lib/types';
import { IdBadge, StatusBadge, RoleBadge } from './Badges';
import { useAuth } from '@/context/AuthContext';

export default function EmployeeTable({
  employees,
  onDelete,
}: {
  employees: Employee[];
  onDelete: (employee: Employee) => void;
}) {
  const { user } = useAuth();

  if (employees.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">No employees match these filters</p>
        <p className="mt-1 text-sm text-muted">Try widening your search or clearing filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Designation</th>
            <th className="px-4 py-3 font-medium">Manager</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-bg/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {emp.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <Link href={`/employees/${emp._id}`} className="block truncate font-medium text-ink hover:text-primary">
                      {emp.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <IdBadge id={emp.employeeId} />
                      <span className="truncate text-xs text-muted">{emp.email}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-ink">{emp.department}</td>
              <td className="px-4 py-3 text-ink">{emp.designation}</td>
              <td className="px-4 py-3 text-muted">
                {typeof emp.reportingManager === 'object' && emp.reportingManager ? emp.reportingManager.name : '—'}
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={emp.role} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={emp.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3 text-xs">
                  <Link href={`/employees/${emp._id}`} className="font-medium text-primary hover:underline">
                    View
                  </Link>
                  {user?.role === 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => onDelete(emp)}
                      className="font-medium text-danger hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
