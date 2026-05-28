import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and OTP code are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanOtp = otp.trim();

    const hashedInput = crypto.createHash("sha256").update(cleanOtp).digest("hex");

    // Retrieve active OTP verification for this phone number
    const verification = await prisma.otpVerification.findFirst({
      where: {
        phone: cleanPhone,
        expiresAt: { gt: new Date() },
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "OTP has expired or does not exist. Please request a new code." },
        { status: 400 }
      );
    }

    if (verification.attempts >= 3) {
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Please request a new OTP code." },
        { status: 400 }
      );
    }

    // Verify hash match
    if (verification.otpHash !== hashedInput) {
      await prisma.otpVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 3 - (verification.attempts + 1);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid OTP code. ${remaining} attempts remaining.` 
        },
        { status: 400 }
      );
    }

    // Success - mark as verified
    await prisma.otpVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
    });
  } catch (error: any) {
    console.error("[OTP Verify API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
