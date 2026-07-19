'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import EmployeeForm from '@/components/EmployeeForm';
import { IdBadge, StatusBadge, RoleBadge } from '@/components/Badges';
import { api, getErrorMessage } from '@/lib/api';
import { Employee } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, repRes] = await Promise.all([
        api.get(`/employees/${params.id}`),
        api.get(`/employees/${params.id}/reportees`),
      ]);
      setEmployee(empRes.data.data);
      setReportees(repRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const canManage = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const isSelf = user && employee && user._id === employee._id;
  const salaryFormatted = employee
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(employee.salary)
    : '';

  return (
    <AppShell title={employee?.name || 'Employee'} subtitle={employee?.designation}>
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {employee && !editing && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-card border border-border bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-semibold text-primary">
                    {employee.name.charAt(0)}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">{employee.name}</h2>
                    <p className="text-sm text-muted">{employee.designation} &middot; {employee.department}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <IdBadge id={employee.employeeId} />
                      <RoleBadge role={employee.role} />
                      <StatusBadge status={employee.status} />
                    </div>
                  </div>
                </div>
                {(canManage || isSelf) && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-md border border-border px-3.5 py-2 text-sm font-medium text-ink hover:bg-bg"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
                  <dd className="mt-1 text-sm text-ink">{employee.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Phone</dt>
                  <dd className="mt-1 text-sm text-ink">{employee.phone}</dd>
                </div>
                {canManage && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">Salary</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{salaryFormatted}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Joining date</dt>
                  <dd className="mt-1 text-sm text-ink">{new Date(employee.joiningDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Reporting manager</dt>
                  <dd className="mt-1 text-sm text-ink">
                    {typeof employee.reportingManager === 'object' && employee.reportingManager ? (
                      <Link href={`/employees/${employee.reportingManager._id}`} className="text-primary hover:underline">
                        {employee.reportingManager.name}
                      </Link>
                    ) : (
                      'None'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h3 className="font-display text-base font-semibold text-ink">Direct reports</h3>
            <p className="mt-1 text-xs text-muted">{reportees.length} people report to {employee.name.split(' ')[0]}</p>
            <div className="mt-4 space-y-3">
              {reportees.length === 0 && <p className="text-sm text-muted">No direct reports.</p>}
              {reportees.map((r) => (
                <Link
                  key={r._id}
                  href={`/employees/${r._id}`}
                  className="flex items-center gap-3 rounded-md border border-border p-2.5 transition-colors hover:bg-bg"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {r.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                    <p className="truncate text-xs text-muted">{r.designation}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {employee && editing && (
        <div className="max-w-3xl rounded-card border border-border bg-surface p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Edit employee</h3>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
          </div>
          <EmployeeForm
            mode="edit"
            employee={employee}
            onSuccess={(updated) => {
              setEmployee(updated);
              setEditing(false);
              if (isSelf) router.refresh();
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
