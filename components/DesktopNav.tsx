// components/DesktopNav.tsx
'use client';

import React from 'react';
import { NavItem } from '@/components/nav-items';
import { Home, Users2, PlusCircle, User as UserIcon } from 'lucide-react';

interface DesktopNavProps {
  userRole: string;
}

function DesktopNav({ userRole }: DesktopNavProps) {
  const isOwner = userRole === 'OWNER';

  // memoize navItems array so it has stable identity unless userRole changes
  const navItems = React.useMemo(() => {
    const items = [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
      { href: '/dashboard/profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
    ];

    if (isOwner) {
      items.splice(1, 0, // insert owner‑only links before Profile
        { href: '/dashboard/flatmates', label: 'Flatmates', icon: <Users2 className="h-5 w-5" /> },
        { href: '/dashboard/calculate', label: 'Create Bill', icon: <PlusCircle className="h-5 w-5" /> },
      );
    }

    return items;
  }, [isOwner]);

  console.log('DesktopNav rendered'); // you’ll now see this only when userRole actually changes

  return (
    <aside className="fixed inset-y-0 top-15 left-0 z-10 hidden w-14 flex-col border-r border-gray-400 sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-5">
        {navItems.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label}>
            {icon}
          </NavItem>
        ))}
      </nav>
    </aside>
  );
}

// React.memo prevents re‑render unless props.userRole changes
export default React.memo(DesktopNav);
