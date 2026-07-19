'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
  icon: (active: boolean) => JSX.Element;
}

const iconProps = (active: boolean) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: active ? 2.25 : 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    roles: ['super_admin', 'hr_manager'],
    icon: (a) => (
      <svg {...iconProps(a)}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/employees',
    label: 'Employees',
    roles: ['super_admin', 'hr_manager'],
    icon: (a) => (
      <svg {...iconProps(a)}>
        <circle cx="9" cy="7" r="3.25" />
        <path d="M2.5 20c.7-3.6 3.3-5.5 6.5-5.5s5.8 1.9 6.5 5.5" />
        <circle cx="17.5" cy="7.5" r="2.5" />
        <path d="M15.8 14.6c2.4.4 4 2.1 4.6 5.4" />
      </svg>
    ),
  },
  {
    href: '/organization',
    label: 'Organization',
    roles: ['super_admin', 'hr_manager'],
    icon: (a) => (
      <svg {...iconProps(a)}>
        <circle cx="12" cy="4.5" r="2" />
        <circle cx="5" cy="19.5" r="2" />
        <circle cx="12" cy="19.5" r="2" />
        <circle cx="19" cy="19.5" r="2" />
        <path d="M12 6.5v6M12 12.5H5v5M12 12.5h7v5" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'My Profile',
    roles: ['super_admin', 'hr_manager', 'employee'],
    icon: (a) => (
      <svg {...iconProps(a)}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20c1.2-4.2 4.2-6.5 7.5-6.5s6.3 2.3 7.5 6.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const SidebarContent = (
    <>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-bold tracking-tighter text-white">
          EM
        </div>
        <div>
          <p className="font-semibold leading-none text-white">EMS</p>
          <p className="mt-1 text-[11px] font-medium leading-none text-white/50 uppercase tracking-wider">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-[14px] transition-all duration-200 ${
                active
                  ? 'bg-white/15 font-semibold text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 px-6 py-6 text-[11px] text-white/40">
        Signed in as
        <div className="mt-1 truncate font-medium text-white/90">{user.name}</div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-primary p-2.5 text-white shadow-lg md:hidden"
        aria-label="Toggle Menu"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-primary transition-transform duration-300 ease-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {SidebarContent}
      </aside>
    </>
  );
}