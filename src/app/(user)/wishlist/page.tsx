'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const wishlist = useCartStore((state) => state.wishlist);

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Your wishlist is empty.</h1>
        <p className="text-slate-700 mb-8 text-lg">Save items you love to build your perfect collection.</p>
        <Link 
          href="/categories" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Explore Products
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Wishlist</h1>
          <p className="text-slate-500">Items you've saved for later.</p>
        </div>
        <span className="text-sm font-medium text-slate-700">{wishlist.length} items</span>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl || ""}
            category="Saved Item" 
          />
        ))}
      </div>
    </div>
  );
}