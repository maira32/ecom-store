import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Link from 'next/link';
import { Receipt, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'We\'ve received your order and are reviewing it.',
  processing: 'Accepted — we\'re preparing/shipping your order.',
  completed: 'Delivered.',
  cancelled: 'This order was cancelled.',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_STYLES: Record<string, string> = {
  unpaid: 'bg-slate-100 text-slate-600',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-200 text-gray-700',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign in to view your orders</h2>
        <Link href="/login" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  await connectDB();
  const userId = (session.user as any).id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 md:mb-10">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="inline-flex bg-white rounded-full p-3 mb-4 border border-slate-200">
            <Receipt className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">No orders yet</p>
          <Link href="/" className="inline-block mt-4 text-sm font-semibold text-slate-900 underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <details key={order._id.toString()} className="group bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <summary className="cursor-pointer list-none px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="text-xs text-slate-500 font-mono">{order._id.toString().slice(-8)}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' · '}
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    title={STATUS_DESCRIPTIONS[order.status]}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm w-20 text-right">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </summary>

              <div className="px-6 pb-5 pt-1 border-t border-slate-100">

                {order.status === 'cancelled' && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
                    <p className="text-red-800 font-medium">
                      This order was cancelled{order.cancelReason ? `: ${order.cancelReason}` : '.'}
                    </p>
                    <p className="text-red-600 mt-1">
                      {order.paymentStatus === 'refunded'
                        ? 'A refund has been issued.'
                        : order.paymentStatus === 'paid'
                        ? 'A refund has not been issued yet. Contact us if you have questions.'
                        : 'No payment was taken for this order.'}
                    </p>
                  </div>
                )}

                {order.revertReason && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                    <p className="text-amber-800 font-medium">
                      This order's status was corrected: {order.revertReason}
                    </p>
                  </div>
                )}

                {order.paymentStatus === 'refunded' && (
                  <div className="mt-4 bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm">
                    <p className="text-gray-800 font-medium">
                      This order was refunded{order.refundReason ? `: ${order.refundReason}` : '.'}
                    </p>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.name} × {item.quantity}</span>
                      <span className="text-slate-900 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-start gap-2 text-xs text-slate-400">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Pending</strong> = received, not yet reviewed. <strong>Accepted</strong> = confirmed and being prepared/shipped. <strong>Completed</strong> = delivered.
        </p>
      </div>
    </div>
  );
}