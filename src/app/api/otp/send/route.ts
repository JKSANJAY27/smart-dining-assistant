import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    // Clean phone number (keep digits only or standard format)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Must be at least 10 digits." },
        { status: 400 }
      );
    }

    // Generate a 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 minutes

    // Store the OTP in the database
    await prisma.otpVerification.create({
      data: {
        phone: cleanPhone,
        otpHash,
        expiresAt,
      },
    });

    // ─── CRITICAL SERVER CONSOLE LOGGING ──────────────────────────────
    // Log the generated OTP clearly to the terminal server console so it can be typed in by the user/tester!
    console.log("\n==================================================");
    console.log(`🔥 [OTP SENT] PHONE: ${cleanPhone} | OTP CODE: ${otp} 🔥`);
    console.log("==================================================\n");

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully. Check the terminal console for the verification code.",
      // Return the OTP in development environment for absolute testing ease
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error: any) {
    console.error("[OTP Send API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
