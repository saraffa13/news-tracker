import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import DailyNews from "@/lib/models/DailyNews";
import UserProgress from "@/lib/models/UserProgress";

// One-time migration: create user and move existing per-article data to UserProgress
export async function POST() {
  try {
    await dbConnect();

    const email = "ssaraffa786@gmail.com";
    const password = "Shivam@123";
    const name = "Shivam";

    // Create user if not exists
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ email, passwordHash, name });
    }
    const userId = user._id;

    // Fetch all daily news docs
    const docs = await DailyNews.find({}).lean();

    let migrated = 0;
    for (const doc of docs) {
      for (const article of doc.articles) {
        // notes might be string or array from old data
        const rawNotes = Array.isArray(article.notes) ? article.notes.filter(Boolean).join("\n") : (article.notes || "");
        const hasNotes = rawNotes.length > 0;
        const hasCanvas = article.canvasData && article.canvasData.length > 0;
        const isStarred = article.starred === true;
        const isRead = article.read === true;
        const learntWords = article.difficult_words
          .filter((w) => w.learnt === true)
          .map((w) => w.word);

        // Only create progress if there's something to migrate
        if (hasNotes || hasCanvas || isStarred || isRead || learntWords.length > 0) {
          await UserProgress.updateOne(
            { userId, date: doc.date, articleId: article.id },
            {
              $set: {
                notes: rawNotes,
                canvasData: article.canvasData || "",
                starred: isStarred,
                read: isRead,
                learntWords,
              },
            },
            { upsert: true }
          );
          migrated++;
        }
      }
    }

    return NextResponse.json({
      message: `Migration complete. User created: ${email}. Migrated ${migrated} article progress records.`,
      userId: userId.toString(),
    });
  } catch (error) {
    console.error("Migration error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Migration failed", detail: msg }, { status: 500 });
  }
}
