'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import OrgTree from '@/components/OrgTree';
import { api, getErrorMessage } from '@/lib/api';
import { OrgNode } from '@/lib/types';

export default function OrganizationPage() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/organization/tree')
      .then(({ data }) => setTree(data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Organization"
      subtitle="Reporting hierarchy across the company"
      allowedRoles={['super_admin', 'hr_manager']}
    >
      {loading && <p className="text-sm text-muted">Loading organization tree…</p>}
      {error && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {!loading && !error && (
        <div className="rounded-card border border-border bg-surface p-6 shadow-card">
          <OrgTree nodes={tree} />
        </div>
      )}
    </AppShell>
  );
}
