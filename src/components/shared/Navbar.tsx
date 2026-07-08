'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems());

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
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black transition">
              Home
            </Link>
            <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-black transition">
              Categories
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-black transition">
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            
            <Link href="/cart" className="relative text-slate-400 hover:text-slate-900 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <Link href="/login" className="text-slate-400 hover:text-slate-900 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}