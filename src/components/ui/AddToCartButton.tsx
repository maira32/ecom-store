'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShieldAlert, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { syncCartBadge } from '@/lib/cartBadge';

interface AddToCartProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function AddToCartButton({ product }: AddToCartProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  if (isAdmin) {
    return (
      <button
        disabled
        title="Admin accounts can't make purchases"
        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
      >
        <ShieldAlert className="w-5 h-5" />
        Admins can't purchase
      </button>
    );
  }

  const handleAddToCart = async () => {
    if (!session) {
    
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">Log in to add items to your cart</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push('/login');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
          </div>
        ),
        { duration: 5000 }
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      await syncCartBadge();
      toast.success(`${product.name} added to your cart`);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
    >
      <ShoppingCart className="w-5 h-5" />
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}