import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, starred } = await request.json();
    if (!date || !articleId || typeof starred !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      { $set: { "articles.$.starred": starred } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("POST /api/articles/star error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const docs = await DailyNews.find(
      { "articles.starred": true },
      { date: 1, newspaper: 1, articles: 1 }
    ).lean();

    const articles: {
      id: string;
      title: string;
      category: string;
      one_line_summary: string;
      date: string;
      newspaper: string;
    }[] = [];

    for (const doc of docs) {
      for (const article of doc.articles) {
        if (article.starred) {
          articles.push({
            id: article.id,
            title: article.title,
            category: article.category,
            one_line_summary: article.one_line_summary,
            date: doc.date,
            newspaper: doc.newspaper,
          });
        }
      }
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET /api/articles/star error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
