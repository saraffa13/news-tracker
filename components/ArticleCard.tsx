"use client";

import { useState } from "react";
import type { Article } from "@/types";
import WordChip from "./WordChip";

export default function ArticleCard({
  article,
  highlightId,
}: {
  article: Article;
  highlightId?: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const isHighlighted = highlightId === article.id;

  return (
    <div
      id={`article-${article.id}`}
      className={`rounded-xl bg-[var(--card)] border p-5 sm:p-6 ${
        isHighlighted
          ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-30"
          : "border-[var(--border-color)]"
      }`}
    >
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <h2 className="text-xl font-bold flex-1">{article.title}</h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent)] bg-opacity-15 text-[var(--accent)] font-medium whitespace-nowrap">
          {article.category}
        </span>
      </div>

      <p className="text-sm italic text-[var(--text-secondary)] mb-4">
        {article.one_line_summary}
      </p>

      {/* Original text - collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline mb-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showOriginal ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Original Article
        </button>
        {showOriginal && (
          <div className="pl-4 border-l-2 border-[var(--border-color)] text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)]">
            {article.original_text}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="rounded-lg bg-[var(--bg)] p-4 mb-4">
        <h4 className="text-sm font-semibold text-[var(--accent)] mb-2">
          Explanation
        </h4>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {article.explanation}
        </div>
      </div>

      {/* Word chips */}
      {article.difficult_words.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.difficult_words.map((w) => (
            <WordChip key={w.word} word={w} />
          ))}
        </div>
      )}
    </div>
  );
}
