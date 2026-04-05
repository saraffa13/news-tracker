"use client";

import { useState } from "react";
import type { DifficultWord } from "@/types";

export default function WordChip({
  word,
  onDelete,
}: {
  word: DifficultWord;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-block relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 text-xs font-medium rounded-full text-white transition-colors border border-[var(--accent)]"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
      >
        {word.word}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 bottom-full mb-2 left-0 w-72 sm:w-80 p-4 rounded-xl bg-[var(--card)] border border-[var(--border-color)] shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[var(--accent)]">{word.word}</h4>
              <span className="text-xs text-[var(--text-secondary)]">
                {word.pronunciation}
              </span>
            </div>
            <p className="text-sm mb-1">
              <span className="text-[var(--text-secondary)]">EN:</span>{" "}
              {word.meaning_english}
            </p>
            <p className="text-sm mb-2">
              <span className="text-[var(--text-secondary)]">HI:</span>{" "}
              {word.meaning_hindi}
            </p>
            <p className="text-xs text-[var(--text-secondary)] italic mb-1">
              &ldquo;{word.example_sentence}&rdquo;
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              <span className="font-medium">In article:</span>{" "}
              {word.context_in_article}
            </p>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${word.word}" from this article?`)) {
                    onDelete();
                    setOpen(false);
                  }
                }}
                className="mt-3 w-full text-xs py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Word
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
