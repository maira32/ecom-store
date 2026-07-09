'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.totalItems());
  
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="border-b border-slate-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
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
                      : 'text-slate-500 hover:text-slate-900 pb-[4px]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-6">
            
            <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <Link 
              href="/wishlist" 
              className={`transition-colors ${
                pathname === '/wishlist' 
                  ? 'text-slate-900' 
                  : 'text-slate-400 hover:text-slate-900' 
              }`}
            >
              <Heart className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/cart" 
              className={`relative transition-colors ${
                pathname === '/cart' 
                  ? 'text-slate-900' 
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <Link 
              href="/login" 
              className={`transition-colors ${
                pathname.startsWith('/login') || pathname.startsWith('/dashboard')
                  ? 'text-slate-900' 
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5" />
            </Link>

          </div>
          
        </div>
      </div>
    </nav>
  );
}