'use client';

import { Heart } from 'lucide-react';
import { useCartStore, ProductItem } from '@/lib/store';

interface WishlistButtonProps {
  product: ProductItem;
  variant?: 'card' | 'detail';
}

export default function WishlistButton({ product, variant = 'card' }: WishlistButtonProps) {
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isInWishlist = useCartStore((state) => state.isInWishlist(product.id));

  if (variant === 'detail') {
    return (
      <button
        onClick={() => toggleWishlist(product)}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl border font-semibold transition-colors ${
          isInWishlist
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        {isInWishlist ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 hover:bg-white transition-colors shadow-sm"
    >
      <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
    </button>
  );
}