export interface DifficultWord {
  word: string;
  pronunciation: string;
  meaning_english: string;
  meaning_hindi: string;
  example_sentence: string;
  context_in_article: string;
  learnt?: boolean;
}

export interface KeyDate {
  date: string;
  event: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  word_count?: number;
  original_text: string;
  explanation: string;
  one_line_summary: string;
  difficult_words: DifficultWord[];
  key_dates?: KeyDate[];
  starred?: boolean;
  notes?: string;
  canvasData?: string;
  read?: boolean;
}

export interface DailyNewsInput {
  date: string;
  newspaper: string;
  articles: Article[];
}

export interface DailyNewsDocument extends DailyNewsInput {
  _id: string;
  createdAt: Date;
}

export interface DailyNewsSummary {
  date: string;
  newspaper: string;
  articleCount: number;
  wordCount: number;
  unreadCount: number;
}

export interface WordSearchResult {
  word: string;
  pronunciation: string;
  meaning_english: string;
  meaning_hindi: string;
  example_sentence: string;
  context_in_article: string;
  articleTitle: string;
  articleId: string;
  date: string;
}

export interface ArticleSearchResult {
  id: string;
  title: string;
  category: string;
  one_line_summary: string;
  date: string;
}
