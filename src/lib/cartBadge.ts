import { useCartStore } from '@/lib/store';


export async function syncCartBadge() {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) return;
    const data = await res.json();
    const uniqueCount = Array.isArray(data.items) ? data.items.length : 0;
    useCartStore.getState().setCartBadgeCount(uniqueCount);
  } catch (err) {
    console.error('Failed to sync cart badge:', err);
  }
}