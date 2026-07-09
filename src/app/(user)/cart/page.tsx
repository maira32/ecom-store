'use client';

import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 15.00 : 0; 
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Your cart is empty.</h1>
        <p className="text-slate-900 mb-8 text-lg">Looks like you have not added anything to your cart yet.</p>
        <Link 
          href="/categories" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-12">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        
        <section className="lg:col-span-7">
          <ul role="list" className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {cart.map((item) => (
              <li key={item.id} className="flex py-6 sm:py-10">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Image
                  </div>
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">
                          <Link href={`/product/${item.id}`} className="hover:text-slate-600">
                            {item.name}
                          </Link>
                        </h3>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-900">${item.price.toFixed(2)}</p>
                      <p className="mt-1 text-sm text-slate-900">Qty: {item.quantity}</p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="-m-2 inline-flex p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="sr-only">Remove</span>
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Order summary</h2>

          <dl className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-900">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <dt>Shipping estimate</dt>
              <dd className="font-medium text-slate-900">${shipping.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
              <dt>Order total</dt>
              <dd>${total.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <button
              type="button"
              className="w-full rounded-xl bg-slate-900 px-4 py-4 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              Checkout
            </button>
          </div>
        </section>
        
      </div>
    </div>
  );
}