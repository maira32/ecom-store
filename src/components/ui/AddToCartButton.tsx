'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

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

  const handleAddToCart = async () => {
    if (!session) {
      alert("Please log in to add items to your cart.");
      router.push('/login');
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

      alert(`${product.name} added to your cart!`);
      
      router.refresh(); 

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
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