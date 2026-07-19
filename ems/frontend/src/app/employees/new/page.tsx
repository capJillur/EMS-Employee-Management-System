'use client';

import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import EmployeeForm from '@/components/EmployeeForm';

export default function NewEmployeePage() {
  const router = useRouter();

  return (
    <AppShell title="Add employee" subtitle="Create a new employee record" allowedRoles={['super_admin', 'hr_manager']}>
      <div className="max-w-3xl rounded-card border border-border bg-surface p-6 shadow-card">
        <EmployeeForm mode="create" onSuccess={(emp) => router.push(`/employees/${emp._id}`)} />
      </div>
    </AppShell>
  );
}
