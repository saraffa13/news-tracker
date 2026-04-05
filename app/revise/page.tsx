"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WordCard from "@/components/WordCard";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import type { WordSearchResult } from "@/types";

interface ReviseSection {
  label: string;
  date: string;
  words: WordSearchResult[];
}

export default function RevisePage() {
  const [sections, setSections] = useState<ReviseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    fetch("/api/revise")
      .then((r) => r.json())
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (date: string, articleId: string, word: string) => {
    try {
      const res = await fetch("/api/words/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word }),
      });
      if (res.ok) {
        setSections((prev) =>
          prev.map((s) => ({
            ...s,
            words: s.words.filter(
              (w) => !(w.word === word && w.articleId === articleId && w.date === date)
            ),
          }))
        );
        showToast(`"${word}" deleted`, "success");
      } else {
        showToast("Failed to delete word", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Revise</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyWords = sections.some((s) => s.words.length > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Revise</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Spaced repetition — review words from yesterday, last week, and last month.
        </p>
      </div>

      {!hasAnyWords ? (
        <div className="text-center py-20">
          <svg
            className="mx-auto mb-4 text-[var(--text-secondary)]"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Nothing to revise yet</h2>
          <p className="text-[var(--text-secondary)]">
            Words will appear here once you have entries from yesterday, 7 days ago, or 30 days ago.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold">{section.label}</h2>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatDate(section.date)}
                </span>
                {section.words.length > 0 && (
                  <Link
                    href={`/day/${section.date}`}
                    className="text-xs text-[var(--accent)] hover:underline ml-auto"
                  >
                    View full day
                  </Link>
                )}
              </div>

              {section.words.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] py-4 px-4 rounded-lg bg-[var(--card)] border border-[var(--border-color)]">
                  No entries for {formatDate(section.date)}.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.words.map((w, idx) => (
                    <WordCard
                      key={`${w.word}-${idx}`}
                      word={w}
                      articleTitle={w.articleTitle}
                      date={w.date}
                      onDelete={() => handleDelete(w.date, w.articleId, w.word)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
