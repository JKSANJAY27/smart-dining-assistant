"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

interface OTPInputProps {
  phone: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
}

export function OTPInput({ phone, onVerify, onResend }: OTPInputProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Submit if all 6 digits are filled
    const completedCode = newCode.join("");
    if (completedCode.length === 6) {
      handleAutoSubmit(completedCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Move focus to previous input on backspace if current is empty
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setCode(digits);
    inputRefs.current[5]?.focus();
    handleAutoSubmit(pastedData);
  };

  const handleAutoSubmit = async (fullOtp: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const success = await onVerify(fullOtp);
      if (!success) {
        setError("Invalid verification code. Please check and try again.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendClick = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
      setTimer(30);
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-center space-y-1.5">
        <div className="w-10 h-10 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 flex items-center justify-center mx-auto mb-2 text-[#D97706]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Enter Verification Code</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          We&apos;ve sent a 6-digit OTP code to verify your phone number ending in <span className="text-gray-900 font-bold">{phone.slice(-4)}</span>.
        </p>
      </div>

      {/* OTP Code Boxes */}
      <div className="flex justify-center gap-2 md:gap-3 py-1">
        {code.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            disabled={isVerifying}
            className={`w-11 h-12 text-center text-lg font-black text-gray-900 bg-[#FAF7F2] border ${
              digit 
                ? "border-[#D97706] ring-2 ring-[#D97706]/10 shadow-xs" 
                : "border-[#EBE3D5]"
            } rounded-xl focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 outline-none transition-all`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Countdown and Resend */}
      <div className="text-center text-xs">
        {timer > 0 ? (
          <p className="text-gray-500">
            Resend code in <span className="text-[#D97706] font-bold">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            disabled={isResending}
            className="text-[#D97706] font-bold hover:text-[#C2410C] transition-colors flex items-center justify-center gap-1.5 mx-auto py-1 cursor-pointer select-none no-min-size"
          >
            <RefreshCw className={`w-3.5 h-3.5 no-min-size ${isResending ? "animate-spin" : ""}`} />
            <span>Resend OTP Code</span>
          </button>
        )}
      </div>

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 py-1 text-xs text-[#D97706] font-bold">
          <div className="w-3.5 h-3.5 rounded-full border border-[#D97706]/30 border-t-[#D97706] animate-spin" />
          <span>Verifying order...</span>
        </div>
      )}
    </div>
  );
}
