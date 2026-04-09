"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article, DifficultWord } from "@/types";
import Timeline from "./Timeline";
import InlineWordsText from "./InlineWordsText";
import AddWordsInput from "./AddWordsInput";

export default function ArticleCard({
  article,
  date,
  highlightId,
  onDeleteWord,
  onDeleteArticle,
  onToggleLearnt,
  onToggleStar,
  onToggleRead,
  onWordsAdded,
}: {
  article: Article;
  date?: string;
  highlightId?: string;
  onDeleteWord?: (articleId: string, word: string) => void;
  onDeleteArticle?: (articleId: string) => void;
  onToggleLearnt?: (articleId: string, word: string, learnt: boolean) => void;
  onToggleStar?: (articleId: string, starred: boolean) => void;
  onToggleRead?: (articleId: string, read: boolean) => void;
  onWordsAdded?: (articleId: string, words: DifficultWord[]) => void;
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
          {onToggleRead && (
            <button
              onClick={() => onToggleRead(article.id, !article.read)}
              className={`p-1.5 rounded-md transition-colors ${
                article.read ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
              } hover:bg-[var(--border-color)]`}
              title={article.read ? "Mark as unread" : "Mark as read"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {article.read ? (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </>
                ) : (
                  <circle cx="12" cy="12" r="9" />
                )}
              </svg>
            </button>
          )}
          {date && (
            <Link
              href={`/day/${date}/article/${article.id}`}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border-color)] transition-colors"
              title="Open article"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          )}
          {onToggleStar && (
            <button
              onClick={() => onToggleStar(article.id, !article.starred)}
              className="p-1.5 rounded-md transition-colors"
              title={article.starred ? "Unstar article" : "Star article"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={article.starred ? "var(--accent)" : "none"}
                stroke={article.starred ? "var(--accent)" : "var(--text-secondary)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}
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
        {article.word_count ? <span className="not-italic ml-2 text-xs opacity-60">({article.word_count} words)</span> : null}
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
          <div className="pl-4 border-l-2 border-[var(--accent)] text-sm leading-relaxed text-[var(--text-primary)] bg-[var(--bg)] rounded-r-lg p-4">
            <InlineWordsText
              text={article.original_text}
              words={article.difficult_words}
              onToggleLearnt={
                onToggleLearnt ? (w, l) => onToggleLearnt(article.id, w, l) : undefined
              }
              onDelete={
                onDeleteWord ? (w) => onDeleteWord(article.id, w) : undefined
              }
            />
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
          <div className="rounded-lg bg-[var(--bg)] p-4 text-sm leading-relaxed text-[var(--text-primary)]">
            <InlineWordsText
              text={article.explanation}
              words={article.difficult_words}
              onToggleLearnt={
                onToggleLearnt ? (w, l) => onToggleLearnt(article.id, w, l) : undefined
              }
              onDelete={
                onDeleteWord ? (w) => onDeleteWord(article.id, w) : undefined
              }
            />
          </div>
        )}
      </div>

      {/* Timeline */}
      {article.key_dates && article.key_dates.length > 0 && (
        <Timeline dates={article.key_dates} />
      )}

      {/* Add words input */}
      {date && onWordsAdded && (
        <AddWordsInput
          articleId={article.id}
          articleText={article.original_text}
          date={date}
          onWordsAdded={(words) => onWordsAdded(article.id, words)}
        />
      )}
    </div>
  );
}
