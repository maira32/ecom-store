'use client';

import { useState } from 'react';
import { Reply, X, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReplyMessageButtonProps {
  id: string;
  toEmail: string;
  toName: string;
  originalMessage: string;
}

export default function ReplyMessageButton({ id, toEmail, toName, originalMessage }: ReplyMessageButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/contact/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send reply');
      }

      setOpen(false);
      setReplyText('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        title="Reply to message"
      >
        <Reply className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Reply to {toName}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-1">To: {toEmail}</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-600 mb-4 max-h-24 overflow-y-auto">
              {originalMessage}
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Type your reply..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-sm text-slate-900"
            />

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <button
              onClick={handleSend}
              disabled={sending || !replyText.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}