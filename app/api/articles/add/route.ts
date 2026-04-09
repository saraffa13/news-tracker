import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, article } = await request.json();

    if (!date || !article) {
      return NextResponse.json(
        { error: "date and article are required" },
        { status: 400 }
      );
    }

    if (
      !article.id ||
      !article.title ||
      !article.category ||
      !article.original_text ||
      !article.explanation ||
      !article.one_line_summary ||
      !Array.isArray(article.difficult_words)
    ) {
      return NextResponse.json(
        { error: "Article is missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const doc = await DailyNews.findOne({ date });
    if (!doc) {
      return NextResponse.json(
        { error: "No entry found for this date" },
        { status: 404 }
      );
    }

    // Check for duplicate article id
    if (doc.articles.some((a: { id: string }) => a.id === article.id)) {
      return NextResponse.json(
        { error: "An article with this ID already exists for this date" },
        { status: 409 }
      );
    }

    const result = await DailyNews.updateOne(
      { date },
      { $push: { articles: article } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add article" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Article added", articleId: article.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/articles/add error:", error);
    return NextResponse.json(
      { error: "Failed to add article" },
      { status: 500 }
    );
  }
}
