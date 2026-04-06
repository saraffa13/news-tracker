import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

// Allow large body for canvas base64 data
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const { date, articleId, canvasData } = JSON.parse(body);
    if (!date || !articleId || typeof canvasData !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $set: { "articles.$.canvasData": canvasData } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Canvas saved" });
  } catch (error) {
    console.error("POST /api/articles/canvas error:", error);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 }
    );
  }
}
