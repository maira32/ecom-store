'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Receipt, Undo2, Info, Search } from 'lucide-react';
import AdminPagination from '@/components/ui/AdminPagination';
import ReasonModal from '@/components/ui/ReasonModal';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user?: { name?: string; email?: string };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'Order placed, not yet reviewed by the store.',
  processing: 'Accepted — the store has confirmed and is preparing/shipping it.',
  completed: 'Delivered / fulfilled in full.',
  cancelled: 'Order will not be fulfilled.',
};

// Universally intuitive tint mapping:
// Pending = yellow, Accepted = blue, Completed = green, Cancelled = red
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Paid = green, Unpaid = neutral, Refunded = gray (grouped visually with
// Cancelled's "nothing further happening here" meaning, but kept distinct
// from red since it's a resolved/neutral state, not a warning).
const PAYMENT_STYLES: Record<string, string> = {
  unpaid: 'bg-slate-100 text-slate-600',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-200 text-gray-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [refundTarget, setRefundTarget] = useState<Order | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setCancelTarget(order);
      return;
    }
    await submitStatusChange(order._id, newStatus);
  };

  const submitStatusChange = async (orderId: string, newStatus: string, reason?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...data.data } : o))
        );
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Something went wrong');
    } finally {
      setUpdatingId(null);
      setCancelTarget(null);
    }
  };

  const submitRefund = async (orderId: string, reason: string) => {
    setRefundingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...data.data } : o))
        );
      } else {
        alert(data.message || 'Refund failed');
      }
    } catch (err) {
      console.error('Refund failed:', err);
      alert('Something went wrong');
    } finally {
      setRefundingId(null);
      setRefundTarget(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (o) =>
        o._id.toLowerCase().includes(term) ||
        (o.user?.name || '').toLowerCase().includes(term) ||
        (o.user?.email || '').toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safePage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">View and manage customer orders.</p>
        </div>
        <button
          onClick={() => setShowLegend((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mt-1"
        >
          <Info className="w-3.5 h-3.5" />
          What do statuses mean?
        </button>
      </div>

      {showLegend && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 space-y-1.5">
          {Object.entries(STATUS_DESCRIPTIONS).map(([key, desc]) => (
            <p key={key}>
              <span className="font-semibold text-slate-900">{STATUS_LABELS[key]}:</span> {desc}
            </p>
          ))}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by customer, email, or order ID..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
        />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
          <div className="bg-slate-100 rounded-full p-3 mb-4">
            <Receipt className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-700 font-medium">No orders yet</p>
          <p className="text-sm text-slate-500 mt-1">Orders will show up here once customers check out.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center text-slate-500">
          No orders match "{searchTerm}"
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-2 md:hidden">← Swipe to see all columns →</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedOrders.map((order) => {
                    const canRefund = order.paymentStatus === 'paid';
                    return (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-slate-600">
                          {order._id.slice(-8)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{order.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{order.user?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            disabled={updatingId === order._id}
                            title={STATUS_DESCRIPTIONS[order.status]}
                            className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-slate-900 disabled:opacity-50 ${STATUS_STYLES[order.status]}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Accepted</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {canRefund ? (
                            <button
                              onClick={() => setRefundTarget(order)}
                              disabled={refundingId === order._id}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {refundingId === order._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Undo2 className="w-3.5 h-3.5" />
                              )}
                              Refund
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredOrders.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}

      {cancelTarget && (
        <ReasonModal
          title="Cancel this order?"
          description={`This tells the customer why order ${cancelTarget._id.slice(-8)} was cancelled. Note: cancelling does NOT automatically refund the customer — use the Refund action separately if payment should be returned.`}
          confirmLabel="Cancel Order"
          confirmColorClass="bg-red-600 hover:bg-red-700"
          submitting={updatingId === cancelTarget._id}
          onCancel={() => setCancelTarget(null)}
          onConfirm={(reason) => submitStatusChange(cancelTarget._id, 'cancelled', reason)}
        />
      )}

      {refundTarget && (
        <ReasonModal
          title="Issue a refund?"
          description={`This immediately refunds order ${refundTarget._id.slice(-8)} ($${refundTarget.total.toFixed(2)}) via Stripe. This cannot be undone.`}
          confirmLabel="Issue Refund"
          confirmColorClass="bg-red-600 hover:bg-red-700"
          submitting={refundingId === refundTarget._id}
          onCancel={() => setRefundTarget(null)}
          onConfirm={(reason) => submitRefund(refundTarget._id, reason)}
        />
      )}
    </div>
  );
}