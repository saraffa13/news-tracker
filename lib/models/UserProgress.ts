import mongoose, { Schema, Model } from "mongoose";

export interface IUserProgress {
  userId: mongoose.Types.ObjectId;
  date: string;
  articleId: string;
  notes: string;
  canvasData: string;
  starred: boolean;
  read: boolean;
  learntWords: string[];
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    articleId: { type: String, required: true },
    notes: { type: String, default: "" },
    canvasData: { type: String, default: "" },
    starred: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    learntWords: { type: [String], default: [] },
  },
  { collection: "userProgress" }
);

UserProgressSchema.index({ userId: 1, date: 1, articleId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, starred: 1 });
UserProgressSchema.index({ userId: 1, "learntWords.0": 1 });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;
