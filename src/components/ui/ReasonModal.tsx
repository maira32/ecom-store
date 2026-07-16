'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ReasonModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColorClass?: string; // e.g. "bg-red-600 hover:bg-red-700"
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export default function ReasonModal({
  title,
  description,
  confirmLabel,
  confirmColorClass = 'bg-slate-900 hover:bg-slate-800',
  submitting,
  onCancel,
  onConfirm,
}: ReasonModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">{description}</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Item out of stock, customer requested cancellation..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm text-slate-900"
        />

        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={!reason.trim() || submitting}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmColorClass}`}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}