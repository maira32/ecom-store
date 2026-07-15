'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const MAX_ATTEMPTS = 8;
const INTERVAL_MS = 1500;

export default function PendingOrderPoller() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      setGaveUp(true);
      return;
    }

    const timer = setTimeout(() => {
      setAttempts((a) => a + 1);
     
      router.refresh();
    }, INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [attempts, router]);

  if (gaveUp) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-700 font-medium">This is taking longer than expected.</p>
        <p className="text-sm text-slate-500 mt-1">
          Your payment went through — refresh this page in a moment, or check your order history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
      <p className="text-slate-600">Confirming your payment...</p>
    </div>
  );
}