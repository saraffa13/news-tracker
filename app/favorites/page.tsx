"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

interface FavArticle {
  id: string;
  title: string;
  category: string;
  one_line_summary: string;
  date: string;
  newspaper: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FavoritesPage() {
  const [articles, setArticles] = useState<FavArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/articles/star")
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnstar = async (article: FavArticle) => {
    try {
      const res = await fetch("/api/articles/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: article.date, articleId: article.id, starred: false }),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => !(a.id === article.id && a.date === article.date)));
        showToast("Article unstarred", "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Favorites</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Your starred articles
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Star articles from the day view to save them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={`${article.date}-${article.id}`}
              className="relative rounded-xl bg-[var(--card)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors group"
            >
              <Link
                href={`/day/${article.date}?article=${article.id}`}
                className="block p-5"
              >
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors flex-1">
                    {article.title}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap flex-shrink-0"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {article.category}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] italic mb-3">
                  {article.one_line_summary}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {article.newspaper} &middot; {formatDate(article.date)}
                </p>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnstar(article);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Unstar article"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
