import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MindMap from "@/lib/models/MindMap";
import { requireAuth } from "@/lib/auth";

// List all mindmaps for the user
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await dbConnect();

    const maps = await MindMap.find(
      { userId: user.userId },
      { title: 1, createdAt: 1, updatedAt: 1, "nodes.id": 1 }
    )
      .sort({ updatedAt: -1 })
      .lean();

    const result = maps.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      nodeCount: m.nodes.length,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/mindmaps error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Create a new mindmap
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json().catch(() => ({}));
    await dbConnect();

    const doc = await MindMap.create({
      userId: user.userId,
      title: body.title || "Untitled Mind Map",
      nodes: [
        {
          id: "root",
          text: body.title || "Central Topic",
          x: 350,
          y: 250,
          color: "#2c3e50",
          width: 140,
          height: 140,
          shape: "circle",
        },
      ],
      edges: [],
    });

    return NextResponse.json(
      { id: doc._id.toString(), message: "Created" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/mindmaps error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
