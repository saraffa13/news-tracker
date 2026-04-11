import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json({ error: "No reset request found" }, { status: 400 });
    }
    if (new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Reset link has expired" }, { status: 400 });
    }
    if (user.resetToken !== token) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      { $set: { passwordHash }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
