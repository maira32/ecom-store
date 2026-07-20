'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MessagesSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative mb-4 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, email, or message..."
        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
      />
    </div>
  );
}