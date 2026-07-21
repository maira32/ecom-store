'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { collection, query, where, orderBy, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Search, ChevronLeft, ChevronRight, CheckCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteNotificationButton from '@/components/ui/DeleteNotificationButton';
import ToggleReadButton from '@/components/ui/ToggleReadButton';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!session) return;
    const userId = (session.user as any).id;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session]);

  const markAllAsRead = async () => {
    const unreadDocs = notifications.filter(n => !n.read);
    if (unreadDocs.length === 0) return;

    setIsMarkingAll(true);
    try {
      const batch = writeBatch(db);
      unreadDocs.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to update notifications');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (!searchTerm.trim()) return notifications;
    const lowerSearch = searchTerm.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(lowerSearch) ||
        n.message.toLowerCase().includes(lowerSearch)
    );
  }, [notifications, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / limit));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * limit;
  const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-2">View system alerts, order updates, and activity logs.</p>
        </div>
        
        {hasUnread && (
          <button
            onClick={markAllAsRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
          >
            {isMarkingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {searchTerm ? `No notifications match "${searchTerm}"` : 'No notifications yet. You are all caught up!'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold w-32">Date</th>
                    <th className="p-4 font-semibold w-48">Title</th>
                    <th className="p-4 font-semibold">Message</th>
                    <th className="p-4 font-semibold w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedNotifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors align-top">
                      
                      <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                        {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Just now'}
                      </td>

                      <td className="p-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                        {n.title}
                      </td>

                      <td className="p-4 text-sm text-slate-700 max-w-md">
                        <details className="group cursor-pointer">
                          <summary className="truncate outline-none list-none font-medium hover:text-slate-900 transition-colors [&::-webkit-details-marker]:hidden">
                            {n.message}
                          </summary>
                          <div className="mt-2 text-slate-600 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-2">
                            {n.message}
                          </div>
                        </details>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {n.read ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}

                          <ToggleReadButton id={n.id} isRead={n.read} />
                          <DeleteNotificationButton id={n.id} />
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 bg-slate-50/50">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-medium">{skip + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(skip + limit, filteredNotifications.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredNotifications.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}