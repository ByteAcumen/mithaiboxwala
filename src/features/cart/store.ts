'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  slug: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  moq: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setItems: (items) => {
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        set({ items, itemCount, subtotal });
      },
      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        );

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          const updated = [...items];
          const newQty = updated[existingIndex].quantity + newItem.quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            totalPrice: newQty * updated[existingIndex].unitPrice,
          };
          updatedItems = updated;
        } else {
          updatedItems = [...items, newItem];
        }

        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        set({ items: updatedItems, itemCount, subtotal, isOpen: true });
      },
      removeItem: (productId, variantId) => {
        const { items } = get();
        const updatedItems = items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        );
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        set({ items: updatedItems, itemCount, subtotal });
      },
      updateQuantity: (productId, quantity, variantId) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const updatedItems = items.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice,
            };
          }
          return item;
        });
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        set({ items: updatedItems, itemCount, subtotal });
      },
      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    {
      name: 'mb_cart_storage',
    }
  )
);
