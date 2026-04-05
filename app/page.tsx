"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DateCard from "@/components/DateCard";
import { DateCardSkeleton } from "@/components/Skeleton";
import type { DailyNewsSummary } from "@/types";

export default function Home() {
  const [data, setData] = useState<DailyNewsSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <DateCard key={item.date} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}
