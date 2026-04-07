import mongoose, { Schema, Model } from "mongoose";

export interface IDailyNews {
  date: string;
  newspaper: string;
  articles: {
    id: string;
    title: string;
    category: string;
    original_text: string;
    explanation: string;
    one_line_summary: string;
    difficult_words: {
      word: string;
      pronunciation: string;
      meaning_english: string;
      meaning_hindi: string;
      example_sentence: string;
      context_in_article: string;
      learnt?: boolean;
    }[];
    key_dates?: {
      date: string;
      event: string;
    }[];
    starred?: boolean;
    notes?: string;
    canvasData?: string;
    read?: boolean;
  }[];
  createdAt: Date;
}

const DifficultWordSchema = new Schema(
  {
    word: { type: String, required: true },
    pronunciation: { type: String, required: true },
    meaning_english: { type: String, required: true },
    meaning_hindi: { type: String, required: true },
    example_sentence: { type: String, required: true },
    context_in_article: { type: String, required: true },
    learnt: { type: Boolean, default: false },
  },
  { _id: false }
);

const KeyDateSchema = new Schema(
  {
    date: { type: String, required: true },
    event: { type: String, required: true },
  },
  { _id: false }
);

const ArticleSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    original_text: { type: String, required: true },
    explanation: { type: String, required: true },
    one_line_summary: { type: String, required: true },
    difficult_words: [DifficultWordSchema],
    key_dates: [KeyDateSchema],
    starred: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    canvasData: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { _id: false }
);

const DailyNewsSchema = new Schema<IDailyNews>(
  {
    date: { type: String, required: true, unique: true },
    newspaper: { type: String, required: true },
    articles: [ArticleSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "dailyNews" }
);

DailyNewsSchema.index(
  { "articles.title": "text", "articles.difficult_words.word": "text" },
  { weights: { "articles.title": 10, "articles.difficult_words.word": 5 } }
);

const DailyNews: Model<IDailyNews> =
  mongoose.models.DailyNews || mongoose.model<IDailyNews>("DailyNews", DailyNewsSchema);

export default DailyNews;
