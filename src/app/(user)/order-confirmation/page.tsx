import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

interface OrderConfirmationProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationProps) {
  const { orderId } = await searchParams;
  const session = await getServerSession(authOptions);

  let order = null;

  if (session && orderId && orderId.match(/^[0-9a-fA-F]{24}$/)) {
    await connectDB();
    const found = await Order.findById(orderId);
    if (found && found.user.toString() === (session.user as any).id) {
      order = found;
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-10">
        <div className="inline-flex bg-green-50 rounded-full p-4 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Order placed</h1>
        <p className="text-slate-600">
          Thanks for shopping with LuxeLane. We've received your order and it's being processed.
        </p>
      </div>

      {order && (
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
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}

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