import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import type { ArticleSearchResult } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json([]);
    }

    await dbConnect();

    const docs = await DailyNews.find({}).sort({ date: -1 }).lean();

    const results: ArticleSearchResult[] = [];
    const queryLower = q.toLowerCase();

    for (const doc of docs) {
      for (const article of doc.articles) {
        if (article.title.toLowerCase().includes(queryLower)) {
          results.push({
            id: article.id,
            title: article.title,
            category: article.category,
            one_line_summary: article.one_line_summary,
            date: doc.date,
          });
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    );
  }
}
