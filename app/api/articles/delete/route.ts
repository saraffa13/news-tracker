import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId } = await request.json();

    if (!date || !articleId) {
      return NextResponse.json(
        { error: "date and articleId are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date },
      { $pull: { articles: { id: articleId } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Article deleted" });
  } catch (error) {
    console.error("POST /api/articles/delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
