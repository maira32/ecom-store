'use client';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColorClass?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmColorClass = 'bg-red-600 hover:bg-red-700',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${confirmColorClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}