"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DateCard from "@/components/DateCard";
import SearchBar from "@/components/SearchBar";
import { DateCardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import type { DailyNewsSummary } from "@/types";

export default function Home() {
  const [data, setData] = useState<DailyNewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteDay = async (date: string) => {
    try {
      const res = await fetch(`/api/news/${date}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => prev.filter((d) => d.date !== date));
        showToast("Day deleted successfully", "success");
      } else {
        showToast("Failed to delete day", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const filtered = data.filter((item) => {
    if (unreadOnly && item.unreadCount === 0) return false;
    if (dateFilter && !item.date.includes(dateFilter)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !item.newspaper.toLowerCase().includes(q) &&
        !item.date.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard.</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Your newspaper learning journal
          </p>
        </div>
        <Link
          href="/add"
          className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Add Today&apos;s News
        </Link>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by newspaper or date..."
          />
        </div>
        <div className="sm:w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            !unreadOnly
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          All days
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            unreadOnly
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Has unread ({data.filter((d) => d.unreadCount > 0).length})
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DateCardSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
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
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No news added yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Start by adding today&apos;s articles!
          </p>
          <Link
            href="/add"
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Your First News
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] py-12">
          No results matching your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <DateCard key={item.date} data={item} onDelete={handleDeleteDay} />
          ))}
        </div>
      )}
    </div>
  );
}
