import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import type { WordSearchResult } from "@/types";

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    await dbConnect();

    const dates = [
      { label: "Yesterday", date: getDateStr(1) },
      { label: "1 Week Ago", date: getDateStr(7) },
      { label: "30 Days Ago", date: getDateStr(30) },
    ];

    const dateValues = dates.map((d) => d.date);
    const docs = await DailyNews.find({ date: { $in: dateValues } }).lean();

    const sections: {
      label: string;
      date: string;
      words: WordSearchResult[];
    }[] = [];

    for (const { label, date } of dates) {
      const doc = docs.find((d) => d.date === date);
      const words: WordSearchResult[] = [];

      if (doc) {
        for (const article of doc.articles) {
          for (const w of article.difficult_words) {
            words.push({
              word: w.word,
              pronunciation: w.pronunciation,
              meaning_english: w.meaning_english,
              meaning_hindi: w.meaning_hindi,
              example_sentence: w.example_sentence,
              context_in_article: w.context_in_article,
              articleTitle: article.title,
              articleId: article.id,
              date: doc.date,
            });
          }
        }
      }

      sections.push({ label, date, words });
    }

    return NextResponse.json(sections);
  } catch (error) {
    console.error("GET /api/revise error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revision words" },
      { status: 500 }
    );
  }
}
