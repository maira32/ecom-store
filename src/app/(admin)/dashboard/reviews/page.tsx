'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Star, Trash2, MessageSquare, Search, History, ChevronDown, ChevronUp } from 'lucide-react';
import AdminPagination from '@/components/ui/AdminPagination';
import toast from 'react-hot-toast'; 

interface EditHistoryItem {
  rating: number;
  comment: string;
  editedAt: string;
}

interface AdminReview {
  _id: string;
  product?: { name?: string };
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isEdited?: boolean;
  editHistory?: EditHistoryItem[];
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = (reviewId: string) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const executeDelete = async () => {
    if (!reviewToDelete) return;

    setDeletingId(reviewToDelete);
    try {
      const res = await fetch(`/api/reviews/${reviewToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
        toast.success('Review deleted successfully');
        setReviewToDelete(null); 
      } else {
        toast.error(data.message || 'Failed to delete review'); 
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Something went wrong'); 
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter(
      (r) =>
        r.userName.toLowerCase().includes(term) ||
        (r.product?.name || '').toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term)
    );
  }, [reviews, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedReviews = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, safePage, pageSize]);

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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reviews</h1>
          <p className="mt-1 text-sm text-slate-600">Moderate customer reviews across all products.</p>
        </div>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by product, customer, or comment..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
            <div className="bg-slate-100 rounded-full p-3 mb-4">
              <MessageSquare className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-700 font-medium">No reviews yet</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center text-slate-500">
            No reviews match "{searchTerm}"
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2 md:hidden">← Swipe to see all columns →</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {paginatedReviews.map((review) => {
                      const hasHistory = review.isEdited || (review.editHistory && review.editHistory.length > 0);
                      const latestEditDate = review.editHistory && review.editHistory.length > 0
                        ? review.editHistory[review.editHistory.length - 1].editedAt
                        : null;

                      return (
                        <tr key={review._id} className="hover:bg-slate-50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            {review.product?.name || 'Deleted product'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                            {review.userName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm max-w-xs break-words">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-800">{review.comment}</span>
                              {hasHistory && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  Edited
                                </span>
                              )}
                            </div>

                            {hasHistory && review.editHistory && review.editHistory.length > 0 && (
                              <div className="mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleHistory(review._id)}
                                  className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
                                >
                                  <History className="w-3.5 h-3.5" />
                                  {expandedHistory[review._id] ? 'Hide History' : 'View Edit History'}
                                  {expandedHistory[review._id] ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {expandedHistory[review._id] && (
                                  <div className="mt-2 space-y-2 border-l-2 border-amber-300 pl-3 py-1 bg-amber-50/60 rounded-r-lg">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Previous Versions</p>
                                    {review.editHistory.map((item, idx) => (
                                      <div key={idx} className="text-xs text-slate-600 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-amber-600">{item.rating} ★</span>
                                          <span className="text-[11px] text-slate-400">
                                            {new Date(item.editedAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="italic text-slate-500">"{item.comment}"</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            <div>{new Date(review.createdAt).toLocaleDateString()}</div>
                            {latestEditDate && (
                              <div className="text-[11px] text-amber-600 font-medium mt-0.5">
                                Updated: {new Date(latestEditDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              onClick={() => setReviewToDelete(review._id)}
                              disabled={deletingId === review._id}
                              className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {deletingId === review._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
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
                totalItems={filteredReviews.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>

      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Review?</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-normal break-words">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setReviewToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={deletingId !== null}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}