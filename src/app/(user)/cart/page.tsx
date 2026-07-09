import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Link from 'next/link';

export default async function CartPage() {
  const session = await getServerSession(authOptions);

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

  await connectDB();
  
  // Fetch the cart and populate the product details
  const cart = await Cart.findOne({ user: (session.user as any).id }).populate('items.product');

  // Calculate the total price
  const cartTotal = cart?.items.reduce((total: number, item: any) => {
    return total + (item.product.price * item.quantity);
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-10">Shopping Cart</h1>
      
      {!cart || cart.items.length === 0 ? (
        <p className="text-slate-600">Your cart is currently empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item: any) => (
              <div key={item._id.toString()} className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden relative">
                  <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                  <p className="text-slate-500">${item.product.price.toFixed(2)}</p>
                  <p className="text-sm text-slate-400 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right font-bold text-slate-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 p-8 rounded-2xl h-fit border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="flex justify-between border-b border-slate-200 pb-4 mb-4 text-slate-600">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-slate-900 mb-8">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}