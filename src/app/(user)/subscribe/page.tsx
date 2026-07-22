'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function SubscribePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (success) {
      setIsPremium(true);
      update({ isPremium: true });
    } else if (session) {
      setIsPremium((session.user as any)?.isPremium);
    }
  }, [session, success, update]);

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.'); 
      setLoading(false);
    }
  };

  const processCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/subscribe/cancel', { method: 'POST' });
      
      if (res.ok) {
        setIsPremium(false);
        await update({ isPremium: false }); 
        setShowCancelModal(false); 
        router.replace('/subscribe'); 
        toast.success('Subscription cancelled successfully.'); 
      } else {
        toast.error('Failed to cancel subscription.'); 
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
        {success && (
          <div className="mb-8 bg-green-50 border border-green-100 rounded-xl p-4 text-green-800 text-sm">
            Welcome to Premium! Your membership is now active.
          </div>
        )}

        <div className="inline-flex bg-slate-900 rounded-full p-4 mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">LuxeLane Premium</h1>
        <p className="text-slate-600 mb-10">
          Become a member for early access to new drops and premium perks.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-left max-w-md mx-auto">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-slate-900">$9.99</span>
            <span className="text-slate-500">/ month</span>
          </div>

          <ul className="space-y-3 mb-8 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              Early access to new products
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              Member-only pricing (coming soon)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              Cancel anytime
            </li>
          </ul>

          {isPremium ? (
            <div className="space-y-3">
              <div className="w-full py-3 rounded-xl bg-green-50 text-green-800 font-semibold text-center border border-green-100">
                You're already a member
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-2 text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                Cancel membership
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Redirecting...' : 'Become a Member'}
            </button>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-left">Cancel Premium?</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-normal break-words text-left">
              Are you sure you want to cancel your Premium membership? You will lose access immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                No, keep it
              </button>
              <button 
                onClick={processCancel}
                disabled={cancelLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}