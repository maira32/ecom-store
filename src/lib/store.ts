import { create } from 'zustand';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem extends ProductItem {
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  totalItems: () => number;

  wishlist: ProductItem[];
  toggleWishlist: (item: ProductItem) => void;
  isInWishlist: (id: string) => boolean;

  cartBadgeCount: number;
  setCartBadgeCount: (n: number) => void;
  incrementCartBadge: (by: number) => void;
}

export const useCartStore = create<StoreState>((set, get) => ({
  cart: [],
  addToCart: (item) => {
    set((state) => {
      const existingItem = state.cart.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    });
  },
  removeFromCart: (id) => {
    set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
  },
  totalItems: () => get().cart.reduce((total, item) => total + item.quantity, 0),

  wishlist: [],
  toggleWishlist: (item) => {
    set((state) => {
      const exists = state.wishlist.some((i) => i.id === item.id);
      if (exists) {
        return { wishlist: state.wishlist.filter((i) => i.id !== item.id) };
      }
      return { wishlist: [...state.wishlist, item] };
    });
  },
  isInWishlist: (id) => get().wishlist.some((item) => item.id === id),

  cartBadgeCount: 0,
  setCartBadgeCount: (n) => set({ cartBadgeCount: Math.max(0, n) }),
  incrementCartBadge: (by) =>
    set((state) => ({ cartBadgeCount: Math.max(0, state.cartBadgeCount + by) })),
}));