'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { DashboardStats } from '@/lib/types';
import { ROLE_LABELS } from './Badges';

const PALETTE = ['#0B3D3A', '#A96B2E', '#4FB6A8', '#C24E4E', '#8FA39B', '#5C6E68'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <p className="mb-4 text-sm font-medium text-ink">{title}</p>
      {children}
    </div>
  );
}

export default function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const roleData = stats.charts.byRole.map((r) => ({
    name: ROLE_LABELS[r.role as keyof typeof ROLE_LABELS] || r.role,
    value: r.count,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ChartCard title="Employees by department">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.charts.byDepartment} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#0B3D3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Role distribution">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {roleData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: 'var(--color-muted)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="lg:col-span-3">
        <ChartCard title="Joining trend by year">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.charts.byJoinYear} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#A96B2E" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
