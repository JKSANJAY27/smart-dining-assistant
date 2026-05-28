"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Phone, User, FileText, ShoppingBag, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "./OTPInput";
import { OrderConfirmation } from "./OrderConfirmation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = "details" | "otp" | "success";

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, sessionId, displayName, getSubtotal, getGST, getTotal, clearCart } = useCartStore();
  
  const [step, setStep] = useState<CheckoutStep>("details");
  const [name, setName] = useState<string>(displayName || "");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStep("otp");
      } else {
        setError(data.error || "Failed to send OTP code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact verification server.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otp: string): Promise<boolean> => {
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "");
    try {
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return false;
      }

      // OTP verified successfully! Now place the order in the kitchen.
      await placeKitchenOrder();
      return true;
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
      return false;
    }
  };

  const placeKitchenOrder = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    try {
      const orderRes = await fetch(`/api/session/${sessionId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: cleanPhone,
          specialNotes: notes.trim() || undefined,
        }),
      });
      const orderData = await orderRes.json();

      if (orderData.success) {
        setCreatedOrderId(orderData.data.orderId);
        clearCart();
        setStep("success");
      } else {
        setError(orderData.error || "Failed to register kitchen order. Try again.");
        setStep("details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact kitchen database.");
      setStep("details");
    }
  };

  const handleResendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to resend code");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-[#F5EFE6] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header (Hidden in Success Step to keep layout sleek) */}
        {step !== "success" && (
          <div className="px-5 py-4 border-b border-[#F5EFE6] bg-[#FAF7F2]/80 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-[#D97706]" />
              <h2 className="text-sm font-extrabold text-gray-900">Place Culinary Order</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#F5EFE6] text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none">
          {step === "details" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-gray-900">Confirm Diner Details</h3>
                <p className="text-xs text-gray-500">
                  Verify your active table details to authenticate the order.
                </p>
              </div>

              {/* Input Fields */}
              <div className="space-y-3.5 pt-2">
                {/* Diner Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Your Name</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/10 transition-colors shadow-2xs">
                    <User className="w-4 h-4 text-[#D97706] shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Sanjay"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Mobile Number</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/10 transition-colors shadow-2xs">
                    <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center justify-between">
                    <span>Special Chef Notes</span>
                    <span className="text-[9px] text-gray-400 normal-case font-medium">Optional</span>
                  </label>
                  <div className="flex items-start gap-2 px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D5] rounded-xl focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#D97706]/10 transition-colors shadow-2xs">
                    <FileText className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <textarea
                      placeholder="e.g. Please make the chicken extra spicy, allergies warnings, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Summary Snippet */}
              <div className="p-3.5 bg-[#FAF7F2] border border-[#EBE3D5] rounded-2xl space-y-2 mt-2 shadow-2xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500 font-bold">Total Items:</span>
                  <span className="text-gray-800 font-bold">{items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                </div>
                <div className="flex justify-between text-xs font-black">
                  <span className="text-gray-900">Amount Payable:</span>
                  <span className="text-[#D97706] font-black">{formatPrice(getTotal())}</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center font-semibold">
                  ⚠️ {error}
                </p>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSendingOtp}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-[#D97706] hover:opacity-95 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-2 select-none cursor-pointer mt-4 no-min-size"
              >
                {isSendingOtp ? (
                  <>
                    <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin" />
                    <span>Requesting Secure Link...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <OTPInput
                phone={phone}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
              />
              
              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                  ⚠️ {error}
                </p>
              )}

              <button
                onClick={() => setStep("details")}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-800 transition-colors py-1 cursor-pointer select-none no-min-size"
              >
                Change Phone Number
              </button>
            </div>
          )}

          {step === "success" && createdOrderId && (
            <OrderConfirmation
              orderId={createdOrderId}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
