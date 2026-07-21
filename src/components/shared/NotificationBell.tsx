'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  link?: string | null;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);


  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/firebase-token');
        const { token } = await res.json();
        await signInWithCustomToken(auth, token);
        if (!cancelled) setFirebaseReady(true);
      } catch (err) {
        console.error('Firebase auth sync failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!firebaseReady || !session) return;
    const userId = (session.user as any).id;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification))
      );
    });

    return () => unsubscribe();
  }, [firebaseReady, session]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  if (!session) return null;

  return (
    
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
<div className="fixed top-16 left-2 right-2 sm:absolute sm:left-auto sm:right-0 sm:top-auto mt-2 sm:w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                    !n.read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    <div className={!n.read ? '' : 'pl-3.5'}>
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}