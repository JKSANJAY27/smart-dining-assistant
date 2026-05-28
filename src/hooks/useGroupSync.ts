"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export function useGroupSync() {
  const socketRef = useSocket();
  const { sessionId, tableId, displayName, setItems, items } = useCartStore();
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !tableId || !sessionId) return;

    const handleConnect = () => {
      setIsConnected(true);
      // Join the table room
      socket.emit("join-table", { tableId, name: displayName });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleTableUsers = (users: string[]) => {
      setActiveUsers(users);
    };

    const handleUserJoined = ({ name }: { name: string }) => {
      if (name !== displayName) {
        toast.info(`${name} joined the table`, {
          description: "Sharing your live cart sync",
          duration: 2500,
        });
      }
    };

    const handleUserLeft = ({ name }: { name: string }) => {
      toast.info(`${name} left the table`, {
        duration: 2500,
      });
    };

    const handleCartSynced = ({
      action,
      item,
      cart,
    }: {
      action: string;
      item: any;
      cart: any;
    }) => {
      console.log("🔄 Real-time cart sync received:", action, item);
      
      // Update local Zustand store items without triggering loops
      if (cart && cart.items) {
        // Convert MenuItem structure if needed
        setItems(cart.items);
      }

      // Display helpful toast notification
      if (item && item.menuItem) {
        if (action === "add") {
          toast.success(`${item.addedBy} added ${item.menuItem.name} to the table cart`, {
            description: `Quantity: ${item.quantity}`,
          });
        } else if (action === "update") {
          toast.info(`${item.addedBy} updated ${item.menuItem.name}`, {
            description: `Quantity: ${item.quantity}`,
          });
        } else if (action === "remove") {
          toast.warning(`${item.addedBy} removed ${item.menuItem.name}`);
        }
      } else {
        toast.info("Table cart synced");
      }
    };

    // Attach listeners
    if (socket.connected) {
      handleConnect();
    }
    
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("table-users", handleTableUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("cart-synced", handleCartSynced);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("table-users", handleTableUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("cart-synced", handleCartSynced);
    };
  }, [socketRef, tableId, sessionId, displayName, setItems]);

  // Function to broadcast local cart changes to other diners
  const broadcastCartChange = (action: "add" | "update" | "remove", item: any, updatedItems: any[]) => {
    const socket = socketRef.current;
    if (!socket || !tableId) return;

    const subtotal = updatedItems.reduce(
      (sum, i) => sum + Number(i.menuItem.price) * i.quantity,
      0
    );
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    socket.emit("cart-item-changed", {
      tableId,
      action,
      item,
      cart: {
        items: updatedItems,
        subtotal,
        gst,
        total,
      },
    });
  };

  return {
    activeUsers,
    isConnected,
    broadcastCartChange,
  };
}
