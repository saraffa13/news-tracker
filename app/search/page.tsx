"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { CardSkeleton } from "@/components/Skeleton";
import type { ArticleSearchResult } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(search, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Article Search</h1>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search article titles (e.g., coal, solar, budget)..."
      />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-4">
              {results.map((r) => (
                <Link
                  key={`${r.date}-${r.id}`}
                  href={`/day/${r.date}?article=${r.id}`}
                >
                  <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 hover:border-[var(--accent)] transition-colors cursor-pointer group">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h3 className="text-lg font-semibold flex-1 group-hover:text-[var(--accent)] transition-colors">
                        {r.title}
                      </h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent)] bg-opacity-15 text-[var(--accent)] font-medium">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-sm italic text-[var(--text-secondary)] mb-2">
                      {r.one_line_summary}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatDate(r.date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <p className="text-center text-[var(--text-secondary)] py-12">
            No articles found matching &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-12">
            Start typing to search article titles.
          </p>
        )}
      </div>
    </div>
  );
}
