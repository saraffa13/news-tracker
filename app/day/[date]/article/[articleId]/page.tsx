"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import InlineWordsText from "@/components/InlineWordsText";
import AddWordsInput from "@/components/AddWordsInput";
import NotesSection from "@/components/NotesSection";
import CanvasSection from "@/components/CanvasSection";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import type { DailyNewsInput, Article, DifficultWord } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  const articleId = params.articleId as string;

  const [data, setData] = useState<DailyNewsInput | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/news/${date}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const article = data?.articles.find((a) => a.id === articleId);

  const updateArticle = (updater: (a: Article) => Article) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        articles: prev.articles.map((a) =>
          a.id === articleId ? updater(a) : a
        ),
      };
    });
  };

  const handleToggleLearnt = async (word: string, learnt: boolean) => {
    try {
      const res = await fetch("/api/words/learnt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word, learnt }),
      });
      if (res.ok) {
        updateArticle((a) => ({
          ...a,
          difficult_words: a.difficult_words.map((w) =>
            w.word === word ? { ...w, learnt } : w
          ),
        }));
        showToast(learnt ? `"${word}" marked as learnt` : `"${word}" unmarked`, "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDeleteWord = async (word: string) => {
    try {
      const res = await fetch("/api/words/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word }),
      });
      if (res.ok) {
        updateArticle((a) => ({
          ...a,
          difficult_words: a.difficult_words.filter((w) => w.word !== word),
        }));
        showToast(`"${word}" deleted`, "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleToggleStar = async (starred: boolean) => {
    try {
      const res = await fetch("/api/articles/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, starred }),
      });
      if (res.ok) {
        updateArticle((a) => ({ ...a, starred }));
        showToast(starred ? "Article starred" : "Article unstarred", "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleSaveNotes = async (notes: string) => {
    try {
      const res = await fetch("/api/articles/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, notes }),
      });
      if (res.ok) {
        updateArticle((a) => ({ ...a, notes }));
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleSaveCanvas = async (canvasData: string) => {
    try {
      const res = await fetch("/api/articles/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, canvasData }),
      });
      if (res.ok) {
        updateArticle((a) => ({ ...a, canvasData }));
        showToast("Canvas saved", "success");
      } else {
        console.error("Canvas save failed:", res.status);
        showToast("Failed to save canvas", "error");
      }
    } catch (e) {
      console.error("Canvas save error:", e);
      showToast("Network error", "error");
    }
  };

  const handleWordsAdded = (words: DifficultWord[]) => {
    updateArticle((a) => ({
      ...a,
      difficult_words: [...a.difficult_words, ...words],
    }));
    showToast(`${words.length} word${words.length > 1 ? "s" : ""} added`, "success");
  };

  const handleDeleteArticle = async () => {
    try {
      const res = await fetch("/api/articles/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId }),
      });
      if (res.ok) {
        showToast("Article deleted", "success");
        router.push(`/day/${date}`);
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data || !article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Article not found</h2>
        <Link
          href={`/day/${date}`}
          className="text-[var(--accent)] hover:underline text-sm"
        >
          Back to {date}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
        <span>/</span>
        <Link href={`/day/${date}`} className="hover:text-[var(--accent)]">{formatDate(date)}</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{article.title}</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold flex-1">{article.title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStar(!article.starred)}
                className="p-2 rounded-md transition-colors"
                title={article.starred ? "Unstar" : "Star"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={article.starred ? "var(--accent)" : "none"}
                  stroke={article.starred ? "var(--accent)" : "var(--text-secondary)"}
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <span
                className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {article.category}
              </span>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${article.title}"?`)) handleDeleteArticle();
                }}
                className="p-2 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors"
                title="Delete article"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-sm italic text-[var(--text-secondary)] mb-6">
            {article.one_line_summary}
          </p>

          {/* Original Article */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Original Article</h3>
            <div className="pl-4 border-l-2 border-[var(--accent)] text-sm leading-relaxed text-[var(--text-primary)] bg-[var(--bg)] rounded-r-lg p-4">
              <InlineWordsText
                text={article.original_text}
                words={article.difficult_words}
                onToggleLearnt={handleToggleLearnt}
                onDelete={handleDeleteWord}
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Explanation</h3>
            <div className="rounded-lg bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--text-primary)]">
              <InlineWordsText
                text={article.explanation}
                words={article.difficult_words}
                onToggleLearnt={handleToggleLearnt}
                onDelete={handleDeleteWord}
              />
            </div>
          </div>

          {/* Timeline */}
          {article.key_dates && article.key_dates.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Key Dates</h3>
              <Timeline dates={article.key_dates} />
            </div>
          )}

          {/* Add words */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Add Vocabulary</h3>
            <AddWordsInput
              articleId={article.id}
              articleText={article.original_text}
              date={date}
              onWordsAdded={handleWordsAdded}
            />
          </div>

        </div>

        {/* Sidebar: stacked on PC, side by side on tablet/mobile */}
        <div className="w-full xl:w-[28rem] flex-shrink-0 xl:sticky xl:top-20">
          <div className="flex gap-4 xl:flex-col xl:h-[calc(100vh-6rem)]">
            <div className="flex-1">
              <NotesSection
                notes={article.notes || ""}
                onSave={handleSaveNotes}
              />
            </div>
            <div className="flex-1">
              <CanvasSection
                canvasData={article.canvasData || ""}
                onSave={handleSaveCanvas}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
