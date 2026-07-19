'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import ProtectedRoute from './ProtectedRoute';
import { Role } from '@/lib/types';

export default function AppShell({
  title,
  subtitle,
  allowedRoles,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  allowedRoles?: Role[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-14 md:pb-0">
          <Navbar title={title} subtitle={subtitle} />
          {actions && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-5 py-3 md:px-8">
              {actions}
            </div>
          )}
          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
