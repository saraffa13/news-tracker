import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, read } = await request.json();
    if (!date || !articleId || typeof read !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $set: { "articles.$.read": read } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("POST /api/articles/read error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
