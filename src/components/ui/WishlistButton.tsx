'use client';

import { Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function WishlistButton({ product }: Props) {
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  return (
    <button 
      onClick={() => toggleWishlist(product)}
      className="p-4 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors flex items-center justify-center bg-white"
      aria-label="Toggle Wishlist"
    >
      <Heart 
        className={`w-6 h-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
      />
    </button>
  );
}