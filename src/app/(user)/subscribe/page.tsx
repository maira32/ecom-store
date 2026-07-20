'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const [loading, setLoading] = useState(false);

  const isPremium = (session?.user as any)?.isPremium;

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
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
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

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-left">
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
          <div className="w-full py-3 rounded-xl bg-green-50 text-green-800 font-semibold text-center">
            You're already a member
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
  );
}