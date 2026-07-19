'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import EmployeeTable from '@/components/EmployeeTable';
import Pagination from '@/components/Pagination';
import CsvImportModal from '@/components/CsvImportModal';
import { api, getErrorMessage } from '@/lib/api';
import { Employee, PaginatedResponse } from '@/lib/types';

const DEPARTMENTS_FALLBACK = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Executive'];

export default function EmployeesPage() {
  const [data, setData] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/employees', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          department: department || undefined,
          role: role || undefined,
          status: status || undefined,
          sortBy,
          sortOrder,
        },
      });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, department, role, status, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const departments = Array.from(
    new Set([...(data?.data.map((e) => e.department) || []), ...DEPARTMENTS_FALLBACK])
  ).sort();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell
      title="Employees"
      subtitle={data ? `${data.total} total records` : undefined}
      allowedRoles={['super_admin', 'hr_manager']}
      actions={
        <>
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search name or email…"
            className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-primary md:w-64"
          />
          <select
            value={department}
            onChange={(e) => {
              setPage(1);
              setDepartment(e.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">All roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="hr_manager">HR Manager</option>
            <option value="employee">Employee</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so as 'asc' | 'desc');
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="joiningDate:desc">Joining date (recent)</option>
            <option value="joiningDate:asc">Joining date (oldest)</option>
          </select>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="rounded-md border border-border px-3.5 py-2 text-sm font-medium text-ink hover:bg-bg"
            >
              Import CSV
            </button>
            <Link
              href="/employees/new"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              + Add employee
            </Link>
          </div>
        </>
      }
    >
      {error && <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {loading && !data ? (
        <p className="text-sm text-muted">Loading employees…</p>
      ) : (
        data && (
          <>
            <EmployeeTable employees={data.data} onDelete={setDeleteTarget} />
            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
          </>
        )
      )}

      {showImport && (
        <CsvImportModal
          onClose={() => setShowImport(false)}
          onDone={fetchEmployees}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface-raised p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink">Remove employee?</h3>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-ink">{deleteTarget.name}</span> will be soft-deleted and marked
              inactive. Their direct reports will be re-assigned to their manager. This can be reversed in the
              database if needed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-border px-3.5 py-2 text-sm text-ink hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-md bg-danger px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
