import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, word } = await request.json();

    if (!date || !articleId || !word) {
      return NextResponse.json(
        { error: "date, articleId, and word are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $pull: { "articles.$.difficult_words": { word } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Word deleted" });
  } catch (error) {
    console.error("POST /api/words/delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}
