"use client";

import { useState } from "react";
import type { Article } from "@/types";
import WordChip from "./WordChip";
import Timeline from "./Timeline";

export default function ArticleCard({
  article,
  highlightId,
  onDeleteWord,
  onDeleteArticle,
}: {
  article: Article;
  highlightId?: string;
  onDeleteWord?: (articleId: string, word: string) => void;
  onDeleteArticle?: (articleId: string) => void;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
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
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full text-white font-medium whitespace-nowrap"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {article.category}
          </span>
          {onDeleteArticle && (
            <button
              onClick={() => {
                if (window.confirm(`Delete article "${article.title}"?`)) {
                  onDeleteArticle(article.id);
                }
              }}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors"
              title="Delete article"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-sm italic text-[var(--text-secondary)] mb-4">
        {article.one_line_summary}
      </p>

      {/* Original text - collapsible */}
      <div className="mb-3">
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

      {/* Explanation - collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline mb-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showExplanation ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Explanation
        </button>
        {showExplanation && (
          <div className="rounded-lg bg-[var(--bg)] p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {article.explanation}
          </div>
        )}
      </div>

      {/* Timeline */}
      {article.key_dates && article.key_dates.length > 0 && (
        <Timeline dates={article.key_dates} />
      )}

      {/* Word chips */}
      {article.difficult_words.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.difficult_words.map((w) => (
            <WordChip
              key={w.word}
              word={w}
              onDelete={
                onDeleteWord
                  ? () => onDeleteWord(article.id, w.word)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
