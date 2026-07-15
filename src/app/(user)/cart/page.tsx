'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Minus, Plus, Loader2, ShoppingBag } from 'lucide-react';
import { syncCartBadge } from '@/lib/cartBadge';
import toast from 'react-hot-toast'; // Added toast for sleek notifications

interface CartItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      const validItems = (data.items || []).filter((item: any) => item.product != null);
      setItems(validItems);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingId(productId);

    setItems((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      // Quantity changes never change the number of DISTINCT products,
      // so the badge doesn't need to change here — but syncing anyway
      // keeps it self-correcting if anything ever drifts.
      await syncCartBadge();
    } catch (err) {
      console.error(err);
      fetchCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdatingId(productId);

    try {
      const res = await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      setItems((prev) => prev.filter((item) => item.product._id !== productId));
      await syncCartBadge();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item. Please try again.'); 
    } finally {
      setUpdatingId(null);
    }
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Checkout failed');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong starting checkout. Please try again.'); 
      setCheckingOut(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Cart is Empty</h2>
        <p className="text-slate-600 mb-8">Please log in to view your cart.</p>
        <Link href="/login" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 md:mb-10">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="inline-flex bg-white rounded-full p-3 mb-4 border border-slate-200">
            <ShoppingBag className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">Your cart is empty</p>
          <p className="text-slate-700 font-medium">Your cart is empty</p>
          <Link href="/" className="inline-block mt-4 text-sm font-semibold text-slate-900 underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm"
              >
                <div className="w-full sm:w-24 h-40 sm:h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.imageUrl || `https://picsum.photos/seed/${item.product.name.replace(/\s+/g, '')}/600/600`}
                    alt={item.product.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{item.product.name}</h3>
                  <p className="text-slate-500 text-sm">${item.product.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      disabled={updatingId === item.product._id || item.quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={updatingId === item.product._id}
                      className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-20 text-right font-bold text-slate-900 text-sm">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeItem(item.product._id)}
                    disabled={updatingId === item.product._id}
                    className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    aria-label="Remove item"
                  >
                    {updatingId === item.product._id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-6 md:p-8 rounded-2xl h-fit border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="flex justify-between border-b border-slate-200 pb-4 mb-4 text-slate-600">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-slate-900 mb-8">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {checkingOut ? 'Redirecting to payment...' : 'Proceed to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}