import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@prisma/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  addedBy: string;
}

interface CartState {
  items: CartItem[];
  sessionId: string | null;
  tableId: string | null;
  displayName: string;

  // Computed
  getItemQuantity: (menuItemId: string) => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getGST: () => number;
  getTotal: () => number;

  // Actions
  setSession: (sessionId: string, tableId: string, displayName: string) => void;
  addItem: (menuItem: MenuItem, qty?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, qty: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,
      tableId: null,
      displayName: "Guest",

      getItemQuantity: (menuItemId) => {
        const item = get().items.find((i) => i.menuItem.id === menuItemId);
        return item?.quantity ?? 0;
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + Number(i.menuItem.price) * i.quantity,
          0
        );
      },

      getGST: () => {
        return Math.round(get().getSubtotal() * 0.05);
      },

      getTotal: () => {
        return get().getSubtotal() + get().getGST();
      },

      setSession: (sessionId, tableId, displayName) => {
        set({ sessionId, tableId, displayName });
      },

      addItem: (menuItem, qty = 1) => {
        const existing = get().items.find((i) => i.menuItem.id === menuItem.id);

        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.menuItem.id === menuItem.id
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          }));
        } else {
          const newItem: CartItem = {
            id: `${menuItem.id}-${Date.now()}`,
            menuItem,
            quantity: qty,
            addedBy: get().displayName,
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }

        toast.success(`Added ${menuItem.name} to cart!`, {
          description: `₹${Number(menuItem.price)} × ${qty}`,
          duration: 2000,
        });
      },

      removeItem: (menuItemId) => {
        const item = get().items.find((i) => i.menuItem.id === menuItemId);
        set((state) => ({
          items: state.items.filter((i) => i.menuItem.id !== menuItemId),
        }));
        if (item) {
          toast.info(`Removed ${item.menuItem.name} from cart`, { duration: 2000 });
        }
      },

      updateQuantity: (menuItemId, qty) => {
        if (qty <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, quantity: qty } : i
          ),
        }));
      },

      updateInstructions: (menuItemId, instructions) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, specialInstructions: instructions } : i
          ),
        }));
      },

      setItems: (items) => set({ items }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "smart-dining-cart",
      // Only persist non-sensitive fields
      partialize: (state) => ({
        items: state.items,
        displayName: state.displayName,
        sessionId: state.sessionId,
        tableId: state.tableId,
      }),
    }
  )
);
