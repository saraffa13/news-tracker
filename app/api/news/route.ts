import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import type { DailyNewsInput } from "@/types";

export async function GET() {
  try {
    await dbConnect();
    const docs = await DailyNews.find({}, { date: 1, newspaper: 1, articles: 1 })
      .sort({ date: -1 })
      .lean();

    const summaries = docs.map((doc) => ({
      date: doc.date,
      newspaper: doc.newspaper,
      articleCount: doc.articles.length,
      wordCount: doc.articles.reduce(
        (sum, a) => sum + a.difficult_words.length,
        0
      ),
      unreadCount: doc.articles.filter((a) => !a.read).length,
    }));

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

function validateNewsJson(data: unknown): data is DailyNewsInput {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d.date))
    return false;
  if (typeof d.newspaper !== "string") return false;
  if (!Array.isArray(d.articles) || d.articles.length === 0) return false;

  for (const article of d.articles) {
    if (!article.id || !article.title || !article.category) return false;
    if (!article.original_text || !article.explanation || !article.one_line_summary)
      return false;
    if (!Array.isArray(article.difficult_words)) return false;
    for (const w of article.difficult_words) {
      if (!w.word || !w.pronunciation || !w.meaning_english) return false;
      if (!w.meaning_hindi || !w.example_sentence || !w.context_in_article)
        return false;
    }
    if (article.key_dates && !Array.isArray(article.key_dates)) return false;
    if (article.key_dates) {
      for (const kd of article.key_dates) {
        if (!kd.date || !kd.event) return false;
      }
    }
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateNewsJson(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid JSON structure. Ensure date (YYYY-MM-DD), newspaper, and articles array with all required fields are provided.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await DailyNews.findOne({ date: body.date });
    if (existing) {
      return NextResponse.json(
        { error: "exists", message: "Data for this date already exists." },
        { status: 409 }
      );
    }

    const doc = await DailyNews.create(body);
    return NextResponse.json(
      { message: "Saved successfully", date: doc.date },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json(
      { error: "Failed to save news" },
      { status: 500 }
    );
  }
}
