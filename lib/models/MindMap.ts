import mongoose, { Schema, Model } from "mongoose";

export interface IMindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  shape: "rect" | "circle";
}

export interface IMindMapEdge {
  id: string;
  from: string;
  to: string;
}

export interface IMindMap {
  userId: mongoose.Types.ObjectId;
  title: string;
  nodes: IMindMapNode[];
  edges: IMindMapEdge[];
  createdAt: Date;
  updatedAt: Date;
}

const MindMapNodeSchema = new Schema<IMindMapNode>(
  {
    id: { type: String, required: true },
    text: { type: String, default: "" },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: { type: String, default: "#4a72b0" },
    width: { type: Number, default: 160 },
    height: { type: Number, default: 60 },
    shape: { type: String, enum: ["rect", "circle"], default: "rect" },
  },
  { _id: false }
);

const MindMapEdgeSchema = new Schema<IMindMapEdge>(
  {
    id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false }
);

const MindMapSchema = new Schema<IMindMap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Mind Map" },
    nodes: [MindMapNodeSchema],
    edges: [MindMapEdgeSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "mindmaps" }
);

MindMapSchema.index({ userId: 1, updatedAt: -1 });

const MindMap: Model<IMindMap> =
  mongoose.models.MindMap || mongoose.model<IMindMap>("MindMap", MindMapSchema);

export default MindMap;
