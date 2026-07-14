import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { stripe } from '@/lib/stripe';

interface OrderConfirmationProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationProps) {
  const { session_id } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session_id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex bg-red-50 rounded-full p-4 mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Something's missing</h1>
        <p className="text-slate-600 mb-10">We couldn't find a payment session to confirm.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Back to shop
        </Link>
      </div>
    );
  }

  await connectDB();
  const userId = (session.user as any).id;

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  if (checkoutSession.payment_status !== 'paid') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex bg-red-50 rounded-full p-4 mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Payment not completed</h1>
        <p className="text-slate-600 mb-10">This order hasn't been paid for yet.</p>
        <Link href="/cart" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Back to cart
        </Link>
      </div>
    );
  }

  let order = await Order.findOne({ stripeSessionId: session_id });

  if (!order) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const validItems = (cart?.items || []).filter((item: any) => item.product != null);

    const orderItems = validItems.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const total = orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    order = await Order.create({
      user: userId,
      items: orderItems,
      total,
      status: 'pending',
      stripeSessionId: session_id,
      paymentStatus: 'paid',
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-10">
        <div className="inline-flex bg-green-50 rounded-full p-4 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Payment successful</h1>
        <p className="text-slate-600">
          Thanks for shopping with LuxeLane. Your order has been received and is being processed.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 md:p-8 mb-10">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <span className="text-sm text-slate-500">Order ID</span>
          <span className="text-sm font-mono text-slate-700">{order._id.toString()}</span>
        </div>

        <div className="space-y-4 mb-6">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-slate-700">{item.name} × {item.quantity}</span>
              <span className="font-medium text-slate-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-lg text-slate-900 pt-4 border-t border-slate-100">
          <span>Total Paid</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}