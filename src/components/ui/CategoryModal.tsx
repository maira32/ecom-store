'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CategoryModalProps {
  mode: 'add' | 'edit';
  initialName?: string;
  submitting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export default function CategoryModal({
  mode,
  initialName = '',
  submitting,
  error,
  onCancel,
  onConfirm,
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {mode === 'add' ? 'Add Category' : 'Edit Category'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-900"
          placeholder="e.g. Summer Collection"
        />

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name.trim())}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'add' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}