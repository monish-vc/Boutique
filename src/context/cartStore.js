import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, size = 'Free Size') => {
    const items = get().items;
    const existing = items.find(
      (i) => i.product.id === product.id && i.size === size
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ items: [...items, { product, size, quantity: 1 }] });
    }
    // Track analytics
    get().trackEvent(product.id, 'add_to_cart');
  },

  removeItem: (productId, size) => {
    set({
      items: get().items.filter(
        (i) => !(i.product.id === productId && i.size === size)
      ),
    });
  },

  updateQuantity: (productId, size, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId, size);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId && i.size === size
          ? { ...i, quantity }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  trackEvent: async (productId, eventType) => {
    try {
      await supabase.from('analytics').insert({
        product_id: productId,
        event_type: eventType,
      });
    } catch (err) {
      // Silent fail for analytics
      console.error('Analytics error:', err);
    }
  },
}));

export default useCartStore;
