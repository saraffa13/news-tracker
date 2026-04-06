import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, notes } = await request.json();
    if (!date || !articleId || typeof notes !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $set: { "articles.$.notes": notes } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notes saved" });
  } catch (error) {
    console.error("POST /api/articles/notes error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
