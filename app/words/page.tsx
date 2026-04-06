"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import WordCard from "@/components/WordCard";
import { CardSkeleton } from "@/components/Skeleton";
import type { WordSearchResult } from "@/types";

export default function WordsPage() {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [allWords, setAllWords] = useState<WordSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all words on mount
  useEffect(() => {
    fetch("/api/words")
      .then((r) => r.json())
      .then(setAllWords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter client-side
  const filtered = allWords.filter((w) => {
    if (query) {
      const q = query.toLowerCase();
      if (!w.word.toLowerCase().includes(q) && !w.meaning_english.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (fromDate && w.date < fromDate) return false;
    if (toDate && w.date > toDate) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">All Words</h1>

      <div className="space-y-4 mb-8">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Filter words..."
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              From date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              To date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {filtered.length} word{filtered.length !== 1 ? "s" : ""}
            {query && ` matching "${query}"`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r, idx) => (
              <Link key={`${r.word}-${r.date}-${idx}`} href={`/day/${r.date}?article=${r.articleId}`}>
                <WordCard
                  word={r}
                  articleTitle={r.articleTitle}
                  date={r.date}
                />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-[var(--text-secondary)] py-12">
          {allWords.length === 0 ? "No words added yet." : "No words match your search."}
        </p>
      )}
    </div>
  );
}
