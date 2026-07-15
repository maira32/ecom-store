'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Receipt, Undo2 } from 'lucide-react';
import AdminPagination from '@/components/ui/AdminPagination';
import toast from 'react-hot-toast'; 

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
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Custom Modal State for Refunds
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [orderToRefund, setOrderToRefund] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
        );
        toast.success('Order status updated');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error('Something went wrong');
    } finally {
      setUpdatingId(null);
    }
  };

  const executeRefund = async () => {
    if (!orderToRefund) return;
    
    setRefundingId(orderToRefund);
    try {
      const res = await fetch(`/api/admin/orders/${orderToRefund}/refund`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderToRefund ? { ...o, status: 'refunded', paymentStatus: 'refunded' } : o
          )
        );
        toast.success('Refund processed successfully');
        setOrderToRefund(null); 
      } else {
        toast.error(data.message || 'Refund failed');
      }
    } catch (err) {
      console.error('Refund failed:', err);
      toast.error('Something went wrong');
    } finally {
      setRefundingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, safePage, pageSize]);

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
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">View and manage customer orders.</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
            <div className="bg-slate-100 rounded-full p-3 mb-4">
              <Receipt className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-700 font-medium">No orders yet</p>
            <p className="text-sm text-slate-500 mt-1">Orders will show up here once customers check out.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2 md:hidden">← Swipe to see all columns →</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[860px] w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {paginatedOrders.map((order) => {
                      const canRefund = order.paymentStatus === 'paid' && order.status !== 'refunded';
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
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id || order.status === 'refunded'}
                              className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-slate-900 disabled:opacity-50 ${STATUS_STYLES[order.status]}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Accepted</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              {order.status === 'refunded' && <option value="refunded">Refunded</option>}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            {canRefund ? (
                              <button
                                onClick={() => setOrderToRefund(order._id)} 
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
                totalItems={orders.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>

      {orderToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Process Refund?</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-normal break-words">
              Are you sure you want to refund this order? This will return the payment to the customer via Stripe and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setOrderToRefund(null)}
                disabled={refundingId !== null}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeRefund}
                disabled={refundingId !== null}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {refundingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}