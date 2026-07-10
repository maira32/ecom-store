'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function PaginationControls({ currentPage, totalPages, limit }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const changeLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(newLimit));
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Show</span>
        <select
          value={limit}
          onChange={(e) => changeLimit(Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
        <span>per page</span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  p === currentPage
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}