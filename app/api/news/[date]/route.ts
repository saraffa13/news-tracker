import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";
import UserProgress from "@/lib/models/UserProgress";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    await dbConnect();
    const doc = await DailyNews.findOne({ date }).lean();

    if (!doc) {
      return NextResponse.json(
        { error: "No data found for this date" },
        { status: 404 }
      );
    }

    // Merge user progress if authenticated
    const auth = getAuthUser(request);
    if (auth) {
      const progressDocs = await UserProgress.find(
        { userId: auth.userId, date }
      ).lean();

      const progressMap = new Map(
        progressDocs.map((p) => [p.articleId, p])
      );

      for (const article of doc.articles) {
        const prog = progressMap.get(article.id);
        if (prog) {
          article.notes = prog.notes || "";
          article.canvasData = prog.canvasData || "";
          article.starred = prog.starred || false;
          article.read = prog.read || false;
          // Mark learnt words
          const learntSet = new Set(prog.learntWords || []);
          for (const w of article.difficult_words) {
            w.learnt = learntSet.has(w.word);
          }
        } else {
          article.notes = "";
          article.canvasData = "";
          article.starred = false;
          article.read = false;
          for (const w of article.difficult_words) {
            w.learnt = false;
          }
        }
      }
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("GET /api/news/[date] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const body = await request.json();
    await dbConnect();

    const doc = await DailyNews.findOneAndUpdate(
      { date },
      { ...body, date },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Updated successfully",
      date: doc.date,
    });
  } catch (error) {
    console.error("PUT /api/news/[date] error:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    await dbConnect();
    const result = await DailyNews.deleteOne({ date });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "No data found for this date" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/news/[date] error:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
