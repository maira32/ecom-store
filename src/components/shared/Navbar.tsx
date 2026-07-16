'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, Heart, LayoutDashboard, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { syncCartBadge } from '@/lib/cartBadge';
import { signOut, useSession } from 'next-auth/react';

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === 'admin';
  const badgeCount = useCartStore((s) => s.cartBadgeCount);

  useEffect(() => {
    if (session && !isAdmin) {
      syncCartBadge();
    }
  }, [session, isAdmin]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

 
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Contact', href: '/contact' },
    ...(session && !isAdmin ? [{ name: 'Orders', href: '/orders' }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="border-b border-slate-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2">

          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-900 flex-shrink-0"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="text-lg sm:text-2xl font-bold tracking-tighter text-slate-900 truncate">
              LuxeLane
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors pt-1 ${
                    isActive
                      ? 'text-slate-900 border-b-2 border-slate-900 pb-[2px]'
                      : 'text-slate-600 hover:text-slate-900 pb-[4px]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">

            {isAdmin && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin Panel</span>
              </Link>
            )}

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {!isAdmin && (
              <>
                <Link
                  href="/wishlist"
                  className={`hidden sm:block transition-colors ${
                    pathname === '/wishlist' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link href="/cart" className="relative text-slate-600 hover:text-slate-900 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {session ? (
              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-xs font-semibold text-slate-500">
                  Hi, {session.user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

          </div>

        </div>

        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          )}

          {!isAdmin && (
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 py-2"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            {session ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Hi, {session.user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm font-medium text-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-600">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}