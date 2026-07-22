'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Trash2, Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  canReview: boolean;
}

export default function ReviewsSection({ productId, initialReviews, canReview }: ReviewsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === 'admin';
  const hasReviewed = reviews.some((r) => r.user === userId);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const roundedAvg = Math.round(avgRating);

  const handlePromptLogin = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">Log in to leave a review</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push('/login');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline flex-shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            Log In
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to submit review');
        return;
      }

      setReviews((prev) => [data.data, ...prev]);
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-24 pt-16 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`w-4 h-4 ${i <= roundedAvg ? 'fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Leave a review — only for logged-in, non-admin, first-time reviewers */}
      {!session ? (
        <button
          onClick={handlePromptLogin}
          className="mb-10 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Log in to leave a review
        </button>
      ) : isAdmin ? null : hasReviewed ? (
        <p className="mb-10 text-sm text-slate-500">You've already reviewed this product.</p>
      ) : !canReview ? (
        <p className="mb-10 text-sm text-slate-500">
          You can leave a review once your order for this product has been marked Completed.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">Leave a review</p>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                aria-label={`Rate ${i} stars`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    i <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts on this product..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm text-slate-900 bg-white"
          />

          <button
            type="submit"
            disabled={!rating || !comment.trim() || submitting}
            className="mt-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Review
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-slate-500 text-sm">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const canDelete = review.user === userId || isAdmin;
            return (
              <div key={review._id} className="border-b border-slate-100 pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{review.userName}</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deletingId === review._id}
                      className="text-slate-300 hover:text-red-600 transition-colors disabled:opacity-50"
                      aria-label="Delete review"
                    >
                      {deletingId === review._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{review.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}