'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/lib/types';

const ITEMS: { href: string; label: string; roles: Role[] }[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['super_admin', 'hr_manager'] },
  { href: '/employees', label: 'Employees', roles: ['super_admin', 'hr_manager'] },
  { href: '/organization', label: 'Org Chart', roles: ['super_admin', 'hr_manager'] },
  { href: '/profile', label: 'Profile', roles: ['super_admin', 'hr_manager', 'employee'] },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;
  const items = ITEMS.filter((i) => i.roles.includes(user.role));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs font-medium ${
              active ? 'text-primary' : 'text-muted'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
