'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import DashboardCards from '@/components/DashboardCards';
import DashboardCharts from '@/components/DashboardCharts';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`}
      allowedRoles={['super_admin', 'hr_manager']}
    >
      {loading && <p className="text-sm text-muted">Loading dashboard…</p>}
      {error && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {stats && (
        <div className="space-y-6">
          <DashboardCards stats={stats} />
          <DashboardCharts stats={stats} />
        </div>
      )}
    </AppShell>
  );
}
