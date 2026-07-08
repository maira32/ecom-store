'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function AddToCartButton({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button 
      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, quantity: 1 })}
      className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
    >
      <ShoppingCart className="w-5 h-5" />
      Add to Cart
    </button>
  );
}