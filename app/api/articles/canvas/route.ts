import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProgress from "@/lib/models/UserProgress";
import { requireAuth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.text();
    const { date, articleId, canvasData } = JSON.parse(body);
    if (!date || !articleId || typeof canvasData !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    await UserProgress.updateOne(
      { userId: user.userId, date, articleId },
      { $set: { canvasData } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Canvas saved" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/articles/canvas error:", error);
    return NextResponse.json({ error: "Failed to save canvas" }, { status: 500 });
  }
}
