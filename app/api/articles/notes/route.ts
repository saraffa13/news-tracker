import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProgress from "@/lib/models/UserProgress";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { date, articleId, notes } = await request.json();
    if (!date || !articleId || typeof notes !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    await UserProgress.updateOne(
      { userId: user.userId, date, articleId },
      { $set: { notes } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Notes saved" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/articles/notes error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
