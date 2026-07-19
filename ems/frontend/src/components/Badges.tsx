import { Role, Status } from '@/lib/types';

export function IdBadge({ id }: { id: string }) {
  return <span className="id-badge">{id}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  const isActive = status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className="status-dot"
        style={{ backgroundColor: isActive ? '#3E8E63' : '#9AA8A2' }}
      />
      <span className={isActive ? 'text-success' : 'text-muted'}>{isActive ? 'Active' : 'Inactive'}</span>
    </span>
  );
}

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  hr_manager: 'HR Manager',
  employee: 'Employee',
};

const ROLE_STYLES: Record<Role, string> = {
  super_admin: 'bg-accent/15 text-accent',
  hr_manager: 'bg-primary/10 text-primary',
  employee: 'bg-muted/15 text-muted',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

export { ROLE_LABELS };
