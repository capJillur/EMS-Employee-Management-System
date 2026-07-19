import { DashboardStats } from '@/lib/types';

export default function DashboardCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: 'Total Employees', value: stats.totalEmployees, hint: 'All records on file' },
    { label: 'Active', value: stats.activeEmployees, hint: 'Currently employed', tone: 'success' as const },
    { label: 'Inactive', value: stats.inactiveEmployees, hint: 'On leave or offboarded', tone: 'muted' as const },
    { label: 'Departments', value: stats.departmentCount, hint: 'Distinct departments' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-card border border-border bg-surface p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
          <p
            className={`mt-2 font-display text-3xl font-semibold ${
              card.tone === 'success' ? 'text-success' : card.tone === 'muted' ? 'text-muted' : 'text-ink'
            }`}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
