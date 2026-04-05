import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyNews from "@/lib/models/DailyNews";

export async function GET(
  _request: NextRequest,
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
