'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast'; 
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export default function ToggleReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: !isRead // Flips it from true to false, or false to true
      });
      toast.success(isRead ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle} 
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
        isRead 
          ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' 
          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
      }`}
      title={isRead ? "Mark as unread" : "Mark as read"}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRead ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
    </button>
  );
}