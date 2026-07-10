'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  Receipt,
  ArrowLeft,
  Menu,
  X,
  Mail,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Categories', href: '/dashboard/categories', icon: Tags },
  { name: 'Orders', href: '/dashboard/orders', icon: Receipt },
  { name: 'Messages', href: '/dashboard/messages', icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#d6d3d3]">

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#cfcccc] border-b border-black/10 px-4 h-14 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Admin Panel</h2>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-black/5 text-slate-900"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside
        className={`
          bg-[#cfcccc] text-slate-900 p-6 flex flex-col w-64 flex-shrink-0
          fixed md:static inset-y-0 left-0 z-50
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-black/5"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-black/5 hover:text-slate-900'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-black/10 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 overflow-y-auto h-screen w-full min-w-0">
        {children}
      </main>

    </div>
  );
}