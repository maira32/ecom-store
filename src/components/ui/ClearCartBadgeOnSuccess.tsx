'use client';

import { useEffect } from 'react';
import { syncCartBadge } from '@/lib/cartBadge';


export default function ClearCartBadgeOnSuccess() {
  useEffect(() => {
    syncCartBadge();
  }, []);

  return null;
}