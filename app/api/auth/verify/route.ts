import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.verified) {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }
    if (!user.verifyOtp || !user.verifyOtpExpiry) {
      return NextResponse.json({ error: "No OTP found. Please sign up again." }, { status: 400 });
    }
    if (new Date() > user.verifyOtpExpiry) {
      return NextResponse.json({ error: "OTP expired. Please sign up again." }, { status: 400 });
    }
    if (user.verifyOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { verified: true }, $unset: { verifyOtp: "", verifyOtpExpiry: "" } }
    );

    const token = signToken({ userId: user._id.toString(), email: user.email });

    const res = NextResponse.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
