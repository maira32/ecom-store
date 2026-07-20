'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function GuestBanner() {
  const { data: session, status } = useSession();

 
  if (status === 'loading' || session) return null;

  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3 text-sm">
        <span className="text-slate-200">Log in to start shopping</span>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline"
        >
          <LogIn className="w-3.5 h-3.5" />
          Log In
        </Link>
      </div>
    </div>
  );
}