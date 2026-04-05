import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import type { WordSearchResult } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await dbConnect();

    // Build the query filter
    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, string>).$gte = from;
      if (to) (filter.date as Record<string, string>).$lte = to;
    }

    const docs = await DailyNews.find(filter)
      .sort({ date: -1 })
      .lean();

    const results: WordSearchResult[] = [];
    const queryLower = q.toLowerCase();

    for (const doc of docs) {
      for (const article of doc.articles) {
        for (const word of article.difficult_words) {
          if (!q || word.word.toLowerCase().includes(queryLower)) {
            results.push({
              word: word.word,
              pronunciation: word.pronunciation,
              meaning_english: word.meaning_english,
              meaning_hindi: word.meaning_hindi,
              example_sentence: word.example_sentence,
              context_in_article: word.context_in_article,
              articleTitle: article.title,
              articleId: article.id,
              date: doc.date,
            });
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/words error:", error);
    return NextResponse.json(
      { error: "Failed to search words" },
      { status: 500 }
    );
  }
}
