import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import UserProgress from "@/lib/models/UserProgress";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { date, articleId, word, learnt } = await request.json();
    if (!date || !articleId || !word || typeof learnt !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    if (learnt) {
      await UserProgress.updateOne(
        { userId: user.userId, date, articleId },
        { $addToSet: { learntWords: word } },
        { upsert: true }
      );
    } else {
      await UserProgress.updateOne(
        { userId: user.userId, date, articleId },
        { $pull: { learntWords: word } }
      );
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/words/learnt error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const progressDocs = await UserProgress.find(
      { userId: user.userId, "learntWords.0": { $exists: true } },
      { date: 1, articleId: 1, learntWords: 1 }
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

    for (const prog of progressDocs) {
      const doc = await DailyNews.findOne(
        { date: prog.date, "articles.id": prog.articleId },
        { "articles.$": 1, date: 1 }
      ).lean();
      if (!doc || !doc.articles[0]) continue;
      const article = doc.articles[0];
      for (const w of article.difficult_words) {
        if (prog.learntWords.includes(w.word)) {
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

    return NextResponse.json(words);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/words/learnt error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
