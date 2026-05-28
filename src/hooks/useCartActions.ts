"use client";

import { useCartStore } from "@/store/cartStore";
import { useGroupSync } from "./useGroupSync";
import type { MenuItem } from "@prisma/client";

export function useCartActions() {
  const store = useCartStore();
  const { broadcastCartChange } = useGroupSync();
  const { sessionId, displayName } = store;

  // Add Item (DB + WebSocket)
  const addItemSynced = async (menuItem: MenuItem, qty: number = 1) => {
    // 1. Local Zustand State Update (Instant)
    store.addItem(menuItem, qty);

    if (!sessionId) return;

    // 2. Server API Call (DB Persistence)
    try {
      const res = await fetch(`/api/session/${sessionId}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: menuItem.id,
          quantity: qty,
          addedBy: displayName,
        }),
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.cart) {
          // Sync with server state
          store.setItems(json.data.cart.items);
          
          // 3. WebSocket Broadcast to Table
          const addedItem = json.data.cart.items.find(
            (i: any) => i.menuItemId === menuItem.id
          );
          broadcastCartChange("add", addedItem, json.data.cart.items);
        }
      }
    } catch (err) {
      console.error("Failed to sync add item to server:", err);
    }
  };

  // Update Quantity (DB + WebSocket)
  const updateQuantitySynced = async (menuItemId: string, qty: number) => {
    const existingItem = store.items.find((i) => i.menuItem.id === menuItemId);
    if (!existingItem) return;

    // If qty is 0, remove the item
    if (qty <= 0) {
      await removeItemSynced(menuItemId);
      return;
    }

    // 1. Local Zustand Update
    store.updateQuantity(menuItemId, qty);

    if (!sessionId) return;

    // Find DB cart item ID
    const cartItemId = existingItem.id;
    if (cartItemId.includes("-")) {
      // Local-only ID, skip DB sync until loaded or fetch full cart
      console.warn("Skipping DB update for local-only ID");
      return;
    }

    // 2. Server API Call
    try {
      const res = await fetch(`/api/session/${sessionId}/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.items) {
          store.setItems(json.data.items);
          
          // 3. WebSocket Broadcast
          const updated = json.data.items.find((i: any) => i.id === cartItemId);
          broadcastCartChange("update", updated, json.data.items);
        }
      }
    } catch (err) {
      console.error("Failed to sync qty update to server:", err);
    }
  };

  // Remove Item (DB + WebSocket)
  const removeItemSynced = async (menuItemId: string) => {
    const existingItem = store.items.find((i) => i.menuItem.id === menuItemId);
    if (!existingItem) return;

    // 1. Local Zustand Update
    store.removeItem(menuItemId);

    if (!sessionId) return;

    const cartItemId = existingItem.id;
    if (cartItemId.includes("-")) return;

    // 2. Server API Call
    try {
      const res = await fetch(`/api/session/${sessionId}/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.items) {
          store.setItems(json.data.items);
          
          // 3. WebSocket Broadcast
          broadcastCartChange("remove", existingItem, json.data.items);
        }
      }
    } catch (err) {
      console.error("Failed to sync removal to server:", err);
    }
  };

  return {
    items: store.items,
    getItemQuantity: store.getItemQuantity,
    getItemCount: store.getItemCount,
    getSubtotal: store.getSubtotal,
    getGST: store.getGST,
    getTotal: store.getTotal,
    addItem: addItemSynced,
    updateQuantity: updateQuantitySynced,
    removeItem: removeItemSynced,
    clearCart: store.clearCart,
  };
}
