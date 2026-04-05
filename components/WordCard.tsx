import type { DifficultWord } from "@/types";

interface WordCardProps {
  word: DifficultWord;
  articleTitle?: string;
  articleId?: string;
  date?: string;
  onArticleClick?: () => void;
}

export default function WordCard({
  word,
  articleTitle,
  date,
  onArticleClick,
}: WordCardProps) {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-[var(--accent)]">{word.word}</h3>
        <span className="text-xs text-[var(--text-secondary)] font-mono">
          {word.pronunciation}
        </span>
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
