import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import UserProgress from "@/lib/models/UserProgress";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { date, articleId, starred } = await request.json();
    if (!date || !articleId || typeof starred !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    await UserProgress.updateOne(
      { userId: user.userId, date, articleId },
      { $set: { starred } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/articles/star error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const starred = await UserProgress.find(
      { userId: user.userId, starred: true },
      { date: 1, articleId: 1 }
    ).lean();

    const articles: {
      id: string;
      title: string;
      category: string;
      one_line_summary: string;
      date: string;
      newspaper: string;
    }[] = [];

    for (const prog of starred) {
      const doc = await DailyNews.findOne(
        { date: prog.date, "articles.id": prog.articleId },
        { "articles.$": 1, newspaper: 1, date: 1 }
      ).lean();
      if (doc && doc.articles[0]) {
        const a = doc.articles[0];
        articles.push({
          id: a.id,
          title: a.title,
          category: a.category,
          one_line_summary: a.one_line_summary,
          date: doc.date,
          newspaper: doc.newspaper,
        });
      }
    }

    return NextResponse.json(articles);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/articles/star error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
