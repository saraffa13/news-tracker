import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendMail, otpEmailHtml } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.verified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existing && !existing.verified) {
      // Update existing unverified user
      await User.updateOne(
        { _id: existing._id },
        { $set: { passwordHash, name, verifyOtp: otp, verifyOtpExpiry: otpExpiry } }
      );
    } else {
      await User.create({
        email: email.toLowerCase(),
        passwordHash,
        name,
        verified: false,
        verifyOtp: otp,
        verifyOtpExpiry: otpExpiry,
      });
    }

    await sendMail(email, "NewsDecoder — Verify your email", otpEmailHtml(name, otp));

    return NextResponse.json({
      message: "Verification code sent to your email",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
