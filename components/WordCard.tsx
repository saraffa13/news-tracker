import type { DifficultWord } from "@/types";

interface WordCardProps {
  word: DifficultWord;
  articleTitle?: string;
  articleId?: string;
  date?: string;
  onArticleClick?: () => void;
  onDelete?: () => void;
  onToggleLearnt?: (learnt: boolean) => void;
}

export default function WordCard({
  word,
  articleTitle,
  date,
  onArticleClick,
  onDelete,
  onToggleLearnt,
}: WordCardProps) {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-[var(--accent)]">{word.word}</h3>
        <div className="flex items-center gap-2">
          {onToggleLearnt && (
            <button
              onClick={() => onToggleLearnt(!word.learnt)}
              className="transition-colors"
              title={word.learnt ? "Mark as unlearnt" : "Mark as learnt"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={word.learnt ? "#f59e0b" : "none"}
                stroke={word.learnt ? "#f59e0b" : "var(--text-secondary)"}
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {word.pronunciation}
          </span>
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Delete "${word.word}"?`)) onDelete();
              }}
              className="text-red-500 hover:text-red-400 transition-colors"
              title="Delete word"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-sm mb-1">
        <span className="font-medium text-[var(--text-secondary)]">English:</span>{" "}
        {word.meaning_english}
      </p>
      <p className="text-sm mb-3">
        <span className="font-medium text-[var(--text-secondary)]">Hindi:</span>{" "}
        {word.meaning_hindi}
      </p>
      <p className="text-sm italic text-[var(--text-secondary)] mb-2">
        &ldquo;{word.example_sentence}&rdquo;
      </p>
      {word.context_in_article && (
        <p className="text-xs text-[var(--text-secondary)]">
          <span className="font-medium">Context:</span> {word.context_in_article}
        </p>
      )}
      {articleTitle && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)]">
            From:{" "}
            {onArticleClick ? (
              <button
                onClick={onArticleClick}
                className="text-[var(--accent)] hover:underline"
              >
                {articleTitle}
              </button>
            ) : (
              <span>{articleTitle}</span>
            )}
            {date && <span className="ml-2">({date})</span>}
          </p>
        </div>
      )}
    </div>
  );
}
