"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WordCard from "@/components/WordCard";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import type { WordSearchResult } from "@/types";

export default function LearntPage() {
  const [words, setWords] = useState<WordSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/words/learnt")
      .then((r) => r.json())
      .then(setWords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnlearn = async (date: string, articleId: string, word: string) => {
    try {
      const res = await fetch("/api/words/learnt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, word, learnt: false }),
      });
      if (res.ok) {
        setWords((prev) => prev.filter((w) => !(w.word === word && w.articleId === articleId && w.date === date)));
        showToast(`"${word}" unmarked`, "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Learnt Words</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Words you&apos;ve marked as learnt
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">No learnt words yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Star words from articles to mark them as learnt.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {words.map((w, idx) => (
            <WordCard
              key={`${w.word}-${idx}`}
              word={{ ...w, learnt: true }}
              articleTitle={w.articleTitle}
              articleId={w.articleId}
              date={w.date}
              onToggleLearnt={() => handleUnlearn(w.date, w.articleId, w.word)}
              onArticleClick={() => {
                window.location.href = `/day/${w.date}?article=${w.articleId}`;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
