import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MindMap from "@/lib/models/MindMap";
import { requireAuth } from "@/lib/auth";

// Get a single mindmap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    await dbConnect();

    const doc = await MindMap.findOne({ _id: id, userId: user.userId }).lean();
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: doc._id.toString(),
      title: doc.title,
      nodes: doc.nodes,
      edges: doc.edges,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/mindmaps/[id] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Update a mindmap (title, nodes, edges)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) update.title = body.title;
    if (body.nodes !== undefined) update.nodes = body.nodes;
    if (body.edges !== undefined) update.edges = body.edges;

    const result = await MindMap.updateOne(
      { _id: id, userId: user.userId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PUT /api/mindmaps/[id] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Delete a mindmap
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    await dbConnect();

    const result = await MindMap.deleteOne({ _id: id, userId: user.userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/mindmaps/[id] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
