"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import TabNav from "@/components/TabNav";
import ArticleCard from "@/components/ArticleCard";
import NotesSection from "@/components/NotesSection";
import CanvasSection from "@/components/CanvasSection";
import WordCard from "@/components/WordCard";
import Timeline from "@/components/Timeline";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import type { DailyNewsInput, Article, DifficultWord } from "@/types";

const tabs = [
  { id: "all", label: "All News" },
  { id: "original", label: "Original Articles" },
  { id: "explained", label: "Explained" },
  { id: "vocabulary", label: "Vocabulary" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DayViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = params.date as string;
  const highlightArticle = searchParams.get("article") || undefined;

  const [data, setData] = useState<DailyNewsInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
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

  useEffect(() => {
    if (highlightArticle && data) {
      setTimeout(() => {
        document
          .getElementById(`article-${highlightArticle}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [highlightArticle, data]);

  const handleDeleteWord = async (articleId: string, word: string) => {
    try {
      const res = await fetch("/api/words/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId
                ? { ...a, difficult_words: a.difficult_words.filter((w) => w.word !== word) }
                : a
            ),
          };
        });
        showToast(`"${word}" deleted`, "success");
      } else {
        showToast("Failed to delete word", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const res = await fetch("/api/articles/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          const remaining = prev.articles.filter((a) => a.id !== articleId);
          if (remaining.length === 0) {
            router.push("/");
            return prev;
          }
          return { ...prev, articles: remaining };
        });
        showToast("Article deleted", "success");
      } else {
        showToast("Failed to delete article", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleToggleLearnt = async (articleId: string, word: string, learnt: boolean) => {
    try {
      const res = await fetch("/api/words/learnt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word, learnt }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId
                ? {
                    ...a,
                    difficult_words: a.difficult_words.map((w) =>
                      w.word === word ? { ...w, learnt } : w
                    ),
                  }
                : a
            ),
          };
        });
        showToast(learnt ? `"${word}" marked as learnt` : `"${word}" unmarked`, "success");
      } else {
        showToast("Failed to update", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleToggleStar = async (articleId: string, starred: boolean) => {
    try {
      const res = await fetch("/api/articles/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, starred }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId ? { ...a, starred } : a
            ),
          };
        });
        showToast(starred ? "Article starred" : "Article unstarred", "success");
      } else {
        showToast("Failed to update", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleSaveNotes = async (articleId: string, notes: string) => {
    try {
      const res = await fetch("/api/articles/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, notes }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId ? { ...a, notes } : a
            ),
          };
        });
        showToast("Notes saved", "success");
      } else {
        showToast("Failed to save notes", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleToggleRead = async (articleId: string, read: boolean) => {
    try {
      const res = await fetch("/api/articles/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, read }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId ? { ...a, read } : a
            ),
          };
        });
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleSaveCanvas = async (articleId: string, canvasData: string) => {
    try {
      const res = await fetch("/api/articles/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, canvasData }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === articleId ? { ...a, canvasData } : a
            ),
          };
        });
        showToast("Canvas saved", "success");
      } else {
        const err = await res.text();
        console.error("Canvas save failed:", res.status, err);
        showToast("Failed to save canvas", "error");
      }
    } catch (e) {
      console.error("Canvas save error:", e);
      showToast("Network error", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">No data for {date}</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          This date doesn&apos;t have any news entries yet.
        </p>
        <Link
          href="/add"
          className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm"
        >
          Add News
        </Link>
      </div>
    );
  }

  const allWords: { word: DifficultWord; article: Article }[] = [];
  for (const article of data.articles) {
    for (const w of article.difficult_words) {
      allWords.push({ word: w, article });
    }
  }
  allWords.sort((a, b) => a.word.word.localeCompare(b.word.word));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{formatDate(date)}</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {data.newspaper} &middot; {data.articles.length} articles &middot;{" "}
          {allWords.length} words
        </p>
      </div>

      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {(activeTab === "all" || activeTab === "original" || activeTab === "explained") && (
        <div className="mt-4 flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => {
            const count = f === "all"
              ? data.articles.length
              : f === "unread"
                ? data.articles.filter((a) => !a.read).length
                : data.articles.filter((a) => a.read).length;
            return (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  readFilter === f
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f === "all" ? "All" : f === "unread" ? "Unread" : "Read"} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {activeTab === "all" &&
          data.articles
            .filter((a) => readFilter === "all" || (readFilter === "unread" ? !a.read : a.read))
            .map((article) => (
            <div key={article.id} className="flex flex-col xl:flex-row gap-4 xl:items-stretch">
              <div className="flex-1 min-w-0">
                <ArticleCard
                  article={article}
                  date={date}
                  highlightId={highlightArticle}
                  onDeleteWord={handleDeleteWord}
                  onDeleteArticle={handleDeleteArticle}
                  onToggleLearnt={handleToggleLearnt}
                  onToggleStar={handleToggleStar}
                  onToggleRead={handleToggleRead}
                />
              </div>
              {/* Notes + Canvas: always side by side */}
              <div className="w-full xl:w-auto flex-shrink-0">
                <div className="flex gap-4 xl:w-[28rem] h-full">
                  <div className="flex-1">
                    <NotesSection
                      notes={article.notes || ""}
                      onSave={(notes) => handleSaveNotes(article.id, notes)}
                    />
                  </div>
                  <div className="flex-1">
                    <CanvasSection
                      canvasData={article.canvasData || ""}
                      onSave={(data) => handleSaveCanvas(article.id, data)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {activeTab === "original" &&
          data.articles
            .filter((a) => readFilter === "all" || (readFilter === "unread" ? !a.read : a.read))
            .map((article) => (
            <div
              key={article.id}
              className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <h2 className="text-xl font-bold flex-1">{article.title}</h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {article.category}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {article.original_text}
              </div>
            </div>
          ))}

        {activeTab === "explained" &&
          data.articles
            .filter((a) => readFilter === "all" || (readFilter === "unread" ? !a.read : a.read))
            .map((article) => (
            <div
              key={article.id}
              className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 sm:p-6"
            >
              <h2 className="text-xl font-bold mb-2">{article.title}</h2>
              <p className="text-sm italic text-[var(--text-secondary)] mb-4">
                {article.one_line_summary}
              </p>
              <div className="rounded-lg bg-[var(--bg)] p-4 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {article.explanation}
              </div>
              {article.key_dates && article.key_dates.length > 0 && (
                <Timeline dates={article.key_dates} />
              )}
            </div>
          ))}

        {activeTab === "vocabulary" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {allWords.map(({ word, article }, idx) => (
              <WordCard
                key={`${word.word}-${idx}`}
                word={word}
                articleTitle={article.title}
                articleId={article.id}
                onDelete={() => handleDeleteWord(article.id, word.word)}
                onToggleLearnt={
                  (learnt) => handleToggleLearnt(article.id, word.word, learnt)
                }
                onArticleClick={() => {
                  setActiveTab("all");
                  setTimeout(() => {
                    document
                      .getElementById(`article-${article.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              />
            ))}
            {allWords.length === 0 && (
              <p className="text-[var(--text-secondary)] col-span-2 text-center py-8">
                No vocabulary words for this day.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
