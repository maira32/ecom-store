'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  Tags,
  Receipt,
  Mail,
  Star,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Bell, 
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';

const navItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Categories', href: '/dashboard/categories', icon: Tags },
  { name: 'Orders', href: '/dashboard/orders', icon: Receipt },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Messages', href: '/dashboard/messages', icon: Mail },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell }, 
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const userId = (session.user as any).id;
    let unsubscribe: () => void;
    let cancelled = false;

    const setupFirebase = async () => {
      try {
        const res = await fetch('/api/firebase-token');
        const { token } = await res.json();
        await signInWithCustomToken(auth, token);
        
        if (cancelled) return;

        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', userId),
          where('read', '==', false)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          setUnreadCount(snapshot.docs.length);
        });
      } catch (err) {
        console.error('Firebase sync failed:', err);
      }
    };

    setupFirebase();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [session]);

  return (
    <div className="flex min-h-screen bg-[#d6d3d3]">
       <Toaster position="top-right" />
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#cfcccc] border-b border-black/10 px-4 h-14 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Admin Panel</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-black/5 text-slate-900"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-black/5"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors
                  ${isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-black/5 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </div>
                
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-black/10 pt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>

           <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 overflow-y-auto h-screen w-full min-w-0">
        {children}
      </main>

      {logoutConfirmOpen && (
        <ConfirmModal
          title="Log out?"
          description="You'll need to log in again to access the admin panel."
          confirmLabel="Log Out"
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={() => signOut({ callbackUrl: '/admin-login' })}
        />
      )}
    </div>
  );
}