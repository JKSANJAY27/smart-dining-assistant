"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChefHat, 
  Users, 
  ClipboardList, 
  Clock, 
  TrendingUp, 
  Map, 
  UtensilsCrossed, 
  CheckCircle, 
  AlertCircle,
  TrendingDown,
  RefreshCw,
  QrCode
} from "lucide-react";
import { QRCodeGenerator } from "@/components/admin/QRCodeGenerator";
import { formatPrice } from "@/lib/utils";

interface AdminOrder {
  id: string;
  sessionId: string;
  customerName: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  estimatedWait: number;
  specialNotes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    specialInstructions?: string;
  }>;
}

interface AdminSession {
  id: string;
  tableId: string;
  status: string;
  guestCount: number;
  createdAt: string;
  cartItemsCount: number;
  ordersCount: number;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PREPARING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  READY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DELIVERED: "bg-stone-500/10 text-stone-400 border-stone-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "tables" | "qr">("orders");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setSessions(data.data.sessions);
        setError(null);
      } else {
        setError(data.error || "Failed to sync administrative dashboard logs.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to administrative server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll data every 10 seconds for real-time kitchen experience!
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update order status local list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (err: any) {
      alert("Failed to connect to order patch server.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(30,16%,6%)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="text-xs text-[hsl(220,10%,55%)] font-black">Syncing Kitchen Control Panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(30,16%,6%)] text-white">
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(28,95%,53%), transparent 70%)",
        }}
      />

      {/* Main Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ChefHat className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-tight">Spice Garden Admin</h1>
            <p className="text-[10px] text-orange-400 font-extrabold mt-0.5 uppercase tracking-widest">Kitchen & Table Seating Controller</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[hsl(220,10%,75%)] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-premium border border-white/5 rounded-2xl p-4.5 space-y-2">
            <div className="flex justify-between items-center text-[hsl(220,10%,55%)]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Tables</span>
              <Users className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{sessions.filter((s) => s.status === "ACTIVE" || s.status === "ORDERED").length}</p>
          </div>

          <div className="glass-premium border border-white/5 rounded-2xl p-4.5 space-y-2">
            <div className="flex justify-between items-center text-[hsl(220,10%,55%)]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Orders</span>
              <Clock className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{orders.filter((o) => o.status === "PENDING").length}</p>
          </div>

          <div className="glass-premium border border-white/5 rounded-2xl p-4.5 space-y-2">
            <div className="flex justify-between items-center text-[hsl(220,10%,55%)]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Kitchen Queue</span>
              <ChefHat className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{orders.filter((o) => ["CONFIRMED", "PREPARING", "READY"].includes(o.status)).length}</p>
          </div>

          <div className="glass-premium border border-white/5 rounded-2xl p-4.5 space-y-2">
            <div className="flex justify-between items-center text-[hsl(220,10%,55%)]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
              <TrendingUp className="w-4.5 h-4.5 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {formatPrice(orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0))}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-white/5 p-1 rounded-2xl bg-[hsl(30,12%,10%)]/50 max-w-sm">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "orders"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                : "text-[hsl(220,10%,60%)] hover:text-white"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Kitchen Queue</span>
          </button>
          <button
            onClick={() => setActiveSubTab("tables")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "tables"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                : "text-[hsl(220,10%,60%)] hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sessions</span>
          </button>
          <button
            onClick={() => setActiveSubTab("qr")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "qr"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                : "text-[hsl(220,10%,60%)] hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Card</span>
          </button>
        </div>

        {/* Sub-tab Content Panels */}
        <AnimatePresence mode="wait">
          {activeSubTab === "orders" && (
            <motion.section
              key="panel-orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
              aria-label="Kitchen Order queue list"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-orange-400">Placed Kitchen Orders</h2>
              {orders.length === 0 ? (
                <div className="glass-premium border border-white/5 rounded-3xl p-12 text-center text-xs text-[hsl(220,10%,55%)] font-bold">
                  No kitchen orders have been placed yet. Scan a QR code to seed ordering!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className={`glass-premium border rounded-3xl p-5 space-y-4 shadow-lg transition-all ${
                        order.status === "PENDING" ? "border-amber-500/30" : "border-white/5"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm font-black text-white">{order.customerName}</h3>
                          <p className="text-[10px] text-[hsl(220,10%,55%)] font-bold font-mono">ID: {order.id.slice(0, 8)}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColors[order.status] || "border-white/15 text-white bg-white/5"}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Item Details */}
                      <div className="space-y-1.5 bg-black/20 p-3 rounded-2xl border border-white/5">
                        <span className="text-[9px] font-black uppercase text-[hsl(220,10%,50%)] tracking-wider block">Ordered Plates:</span>
                        <div className="divide-y divide-white/5 space-y-1 pt-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-xs pt-1 flex justify-between items-baseline">
                              <span className="font-bold text-white truncate max-w-[180px]">
                                {item.menuItemName} <strong className="text-orange-400 font-extrabold ml-1">×{item.quantity}</strong>
                              </span>
                              {item.specialInstructions && (
                                <p className="text-[9px] text-amber-300 italic block mt-0.5">
                                  &quot;{item.specialInstructions}&quot;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Host notes */}
                      {order.specialNotes && (
                        <div className="text-[10px] text-amber-300 italic leading-normal border-l-2 border-orange-500 pl-2">
                          Host notes: &quot;{order.specialNotes}&quot;
                        </div>
                      )}

                      {/* Wait time & Revenue info */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-[hsl(220,10%,55%)]">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>Estimated wait: <strong>{order.estimatedWait}m</strong></span>
                        </div>
                        <span className="font-black text-orange-400 text-sm">{formatPrice(order.totalAmount)}</span>
                      </div>

                      {/* Action selector */}
                      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-[hsl(220,10%,50%)] tracking-wider">Update status:</span>
                        <select
                          value={order.status}
                          disabled={isUpdatingStatus === order.id}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="flex-1 bg-[hsl(30,12%,10%)] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activeSubTab === "tables" && (
            <motion.section
              key="panel-tables"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
              aria-label="Table sessions list"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-orange-400">Live Diners Tables Sessions</h2>
              <div className="glass-premium border border-white/5 rounded-3xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[hsl(30,12%,10%)] border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-[hsl(220,10%,50%)]">
                      <th className="p-4">Table ID</th>
                      <th className="p-4">Co-diners Guest Count</th>
                      <th className="p-4">Session status</th>
                      <th className="p-4">Items in Active Cart</th>
                      <th className="p-4">Orders Placed</th>
                      <th className="p-4">Session Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[hsl(220,10%,55%)] font-bold">
                          No active sessions found in database. Seeding required.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-black text-white">Table {session.tableId}</td>
                          <td className="p-4">{session.guestCount} Diner(s)</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              session.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : session.status === "ORDERED"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-stone-500/10 text-stone-400 border-stone-500/20"
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-orange-400">{session.cartItemsCount} items</td>
                          <td className="p-4 font-bold text-white">{session.ordersCount} order(s)</td>
                          <td className="p-4 text-[hsl(220,10%,55%)]">{new Date(session.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}

          {activeSubTab === "qr" && (
            <motion.section
              key="panel-qr"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              aria-label="QR Code Generator tool"
            >
              <QRCodeGenerator />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
