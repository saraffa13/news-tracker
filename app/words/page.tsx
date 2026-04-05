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
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    try {
      const res = await fetch(`/api/words?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query || fromDate || toDate) {
        search();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, fromDate, toDate, search]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Word Search</h1>

      <div className="space-y-4 mb-8">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search for a word (e.g., curtailment, surge)..."
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
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((r, idx) => (
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
      ) : hasSearched ? (
        <p className="text-center text-[var(--text-secondary)] py-12">
          No words found matching your search.
        </p>
      ) : (
        <p className="text-center text-[var(--text-secondary)] py-12">
          Start typing to search across all your vocabulary.
        </p>
      )}
    </div>
  );
}
