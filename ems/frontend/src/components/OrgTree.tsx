'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrgNode } from '@/lib/types';
import { IdBadge, RoleBadge } from './Badges';

function OrgNodeCard({ node, depth }: { node: OrgNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasReports = node.directReports.length > 0;

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-border pl-6' : ''}>
      <div className="flex items-center gap-2 py-2">
        {hasReports ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted hover:bg-bg hover:text-ink"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}

        <Link
          href={`/employees/${node._id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 shadow-card transition-colors hover:border-primary/40"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: node.status === 'active' ? '#3E8E63' : '#9AA8A2' }}
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-semibold text-primary">
            {node.name.charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{node.name}</span>
            <span className="block truncate text-xs text-muted">{node.designation}</span>
          </span>
          <IdBadge id={node.employeeId} />
          <RoleBadge role={node.role} />
          {hasReports && (
            <span className="hidden shrink-0 font-mono text-[11px] text-muted sm:inline">
              {node.directReports.length} report{node.directReports.length > 1 ? 's' : ''}
            </span>
          )}
        </Link>
      </div>

      {hasReports && expanded && (
        <div>
          {node.directReports.map((child) => (
            <OrgNodeCard key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgTree({ nodes }: { nodes: OrgNode[] }) {
  if (nodes.length === 0) {
    return <p className="text-sm text-muted">No organization data yet.</p>;
  }
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <OrgNodeCard key={node._id} node={node} depth={0} />
      ))}
    </div>
  );
}
