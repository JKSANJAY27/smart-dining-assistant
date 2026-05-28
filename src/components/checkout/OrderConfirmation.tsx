"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, Sparkles, ChefHat, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface OrderConfirmationProps {
  orderId: string;
  onClose: () => void;
}

interface OrderDetails {
  id: string;
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
    menuItem: {
      name: string;
      price: number;
      imageUrl?: string;
      category: string;
    };
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
}

export function OrderConfirmation({ orderId, onClose }: OrderConfirmationProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/order/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.error || "Failed to load order receipt.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to retrieve order.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="text-xs text-[hsl(220,10%,55%)] font-bold">Securing kitchen receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-4xl">⚠️</p>
        <h3 className="text-sm font-black text-white">Receipt Error</h3>
        <p className="text-xs text-[hsl(220,10%,55%)]">{error || "Failed to read receipt details."}</p>
        <Button onClick={onClose} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black">
          Back to Menu
        </Button>
      </div>
    );
  }

  const subtotal = order.totalAmount - order.taxAmount;

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 scrollbar-none py-1">
      {/* Visual Header */}
      <div className="text-center space-y-2 relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(249,115,22,0.4)] animate-bounce-slow">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Order Placed in Kitchen!</h2>
          <p className="text-[11px] text-orange-400 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Chef is Preparing Your Feast</span>
          </p>
        </div>
      </div>

      {/* Preparation Timeline Timer */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-[hsl(30,12%,10%)] to-transparent border border-orange-500/20 shadow-md space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white">Estimated Wait Time</span>
          </div>
          <span className="text-base font-black text-orange-400">~{order.estimatedWait} Mins</span>
        </div>
        
        {/* Animated Cook Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 w-1/4 rounded-full animate-pulse-slow" style={{ width: "25%" }} />
        </div>
        
        <p className="text-[10px] text-[hsl(220,10%,55%)] leading-normal">
          Sit back, relax! Zara will notify you and your friends on this table the second your hot plates leave the kitchen station.
        </p>
      </div>

      {/* Order Item Details Card */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-black uppercase text-[hsl(220,10%,45%)] tracking-wider">Receipt Details</h4>
        <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
          {/* Item Rows */}
          <div className="p-3 space-y-2.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-white truncate">{item.menuItem.name}</span>
                    <span className="text-[10px] text-orange-400 font-extrabold shrink-0">×{item.quantity}</span>
                  </div>
                  {item.specialInstructions && (
                    <p className="text-[10px] text-amber-300/80 italic mt-0.5 truncate">
                      &quot;{item.specialInstructions}&quot;
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-[hsl(220,10%,80%)] shrink-0">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="p-3 space-y-1.5 text-xs bg-black/10">
            <div className="flex justify-between text-[hsl(220,10%,60%)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[hsl(220,10%,60%)]">
              <span>CGST & SGST (5%)</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-white pt-1 text-sm">
              <span>Total Paid</span>
              <span className="text-orange-400 font-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table & Guest Meta */}
      <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-[hsl(220,10%,55%)] bg-[hsl(30,12%,10%)]/50 p-2.5 rounded-xl border border-white/5">
        <div className="flex items-center justify-center gap-1 border-r border-white/5 py-1">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          <span>Table Host: <strong className="text-white">{order.customerName}</strong></span>
        </div>
        <div className="flex items-center justify-center gap-1 py-1">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Receipt ID: <strong className="text-white truncate max-w-[70px]">{order.id.slice(0, 8)}</strong></span>
        </div>
      </div>

      {/* Post-Purchase AI Somm Action */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 text-center space-y-2">
        <p className="text-xs font-bold text-white">🍷 Zara Sommelier Pairings Ready!</p>
        <p className="text-[10px] text-[hsl(220,10%,60%)] leading-relaxed">
          While the kitchen prepares your {order.items[0]?.menuItem.name || "feast"}, ask Zara for perfect vintage reserve drink pairings or dessert upsells!
        </p>
        <button
          onClick={onClose}
          className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center justify-center gap-1 mx-auto hover:text-purple-300 transition-colors cursor-pointer select-none"
        >
          <span>Ask Zara Sommelier Now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Done Button */}
      <Button
        onClick={onClose}
        className="w-full h-11 bg-[hsl(30,12%,10%)] hover:bg-[hsl(30,10%,13%)] border border-white/5 rounded-xl text-xs font-black text-white shadow-md cursor-pointer select-none"
      >
        Close & Continue Dining
      </Button>
    </div>
  );
}
