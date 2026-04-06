import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function POST(request: NextRequest) {
  try {
    const { date, articleId, word, learnt } = await request.json();
    if (!date || !articleId || !word || typeof learnt !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const result = await DailyNews.updateOne(
      { date, "articles.id": articleId },
      {
        $set: {
          "articles.$[art].difficult_words.$[w].learnt": learnt,
        },
      },
      {
        arrayFilters: [{ "art.id": articleId }, { "w.word": word }],
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("POST /api/words/learnt error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const docs = await DailyNews.find(
      { "articles.difficult_words.learnt": true },
      { date: 1, articles: 1 }
    ).lean();

    const words: {
      word: string;
      pronunciation: string;
      meaning_english: string;
      meaning_hindi: string;
      example_sentence: string;
      context_in_article: string;
      articleTitle: string;
      articleId: string;
      date: string;
    }[] = [];

    for (const doc of docs) {
      for (const article of doc.articles) {
        for (const w of article.difficult_words) {
          if (w.learnt) {
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
    }

    return NextResponse.json(words);
  } catch (error) {
    console.error("GET /api/words/learnt error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
