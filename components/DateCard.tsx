"use client";

import Link from "next/link";
import type { DailyNewsSummary } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DateCard({
  data,
  onDelete,
}: {
  data: DailyNewsSummary;
  onDelete?: (date: string) => void;
}) {
  return (
    <div className="relative rounded-xl bg-[var(--card)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors group">
      <Link href={`/day/${data.date}`} className="block p-5">
        <h3 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors">
          {formatDate(data.date)}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {data.newspaper}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
          <span className="text-[var(--accent)] font-medium">
            {data.articleCount} article{data.articleCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[var(--text-secondary)]">
            {data.wordCount} word{data.wordCount !== 1 ? "s" : ""} learned
          </span>
          {data.unreadCount > 0 && (
            <span className="text-orange-500 font-medium">
              {data.unreadCount} unread
            </span>
          )}
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(`Delete all data for ${formatDate(data.date)}? This cannot be undone.`)) {
              onDelete(data.date);
            }
          }}
          className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors opacity-0 group-hover:opacity-100"
          title="Delete day"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
