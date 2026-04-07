"use client";

import { useState, useMemo } from "react";
import type { DifficultWord } from "@/types";

export default function InlineWordsText({
  text,
  words,
  onToggleLearnt,
  onDelete,
}: {
  text: string;
  words: DifficultWord[];
  onToggleLearnt?: (word: string, learnt: boolean) => void;
  onDelete?: (word: string) => void;
}) {
  const [openWord, setOpenWord] = useState<string | null>(null);

  // Build a lookup map (lowercase word -> DifficultWord)
  const wordMap = useMemo(() => {
    const m = new Map<string, DifficultWord>();
    for (const w of words) m.set(w.word.toLowerCase(), w);
    return m;
  }, [words]);

  // Build a single regex matching any of the words (case-insensitive, word boundaries)
  const segments = useMemo(() => {
    if (words.length === 0) return [{ type: "text" as const, value: text, key: "t0" }];

    const escaped = words
      .map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length); // longer first to avoid partial matches
    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

    const parts: { type: "text" | "word"; value: string; key: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let i = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          value: text.slice(lastIndex, match.index),
          key: `t${i++}`,
        });
      }
      parts.push({ type: "word", value: match[0], key: `w${i++}` });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", value: text.slice(lastIndex), key: `t${i++}` });
    }
    return parts;
  }, [text, words]);

  return (
    <span className="whitespace-pre-wrap">
      {segments.map((seg) => {
        if (seg.type === "text") return <span key={seg.key}>{seg.value}</span>;

        const wordData = wordMap.get(seg.value.toLowerCase());
        if (!wordData) return <span key={seg.key}>{seg.value}</span>;

        const isOpen = openWord === seg.key;

        return (
          <span key={seg.key} className="relative inline-block">
            <button
              onClick={() => setOpenWord(isOpen ? null : seg.key)}
              className="font-bold text-[var(--accent)] hover:underline cursor-pointer"
              style={{
                textDecorationThickness: wordData.learnt ? "2px" : undefined,
                textUnderlineOffset: "2px",
              }}
            >
              {seg.value}
            </button>
            {isOpen && (
              <>
                <span
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenWord(null)}
                />
                <span className="absolute z-50 bottom-full mb-2 left-0 w-72 sm:w-80 p-4 rounded-xl bg-[var(--card)] border border-[var(--border-color)] shadow-xl block text-left font-normal">
                  <span className="flex justify-between items-start mb-2">
                    <span className="font-bold text-[var(--accent)]">{wordData.word}</span>
                    <span className="flex items-center gap-2">
                      {onToggleLearnt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLearnt(wordData.word, !wordData.learnt);
                          }}
                          title={wordData.learnt ? "Mark as unlearnt" : "Mark as learnt"}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={wordData.learnt ? "#f59e0b" : "none"}
                            stroke={wordData.learnt ? "#f59e0b" : "var(--text-secondary)"}
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      )}
                      <span className="text-xs text-[var(--text-secondary)]">
                        {wordData.pronunciation}
                      </span>
                    </span>
                  </span>
                  <span className="block text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">EN:</span>{" "}
                    {wordData.meaning_english}
                  </span>
                  <span className="block text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">HI:</span>{" "}
                    {wordData.meaning_hindi}
                  </span>
                  <span className="block text-xs text-[var(--text-secondary)] italic mb-1">
                    &ldquo;{wordData.example_sentence}&rdquo;
                  </span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-2">
                    <span className="font-medium">In article:</span>{" "}
                    {wordData.context_in_article}
                  </span>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${wordData.word}"?`)) {
                          onDelete(wordData.word);
                          setOpenWord(null);
                        }
                      }}
                      className="mt-3 w-full text-xs py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Delete Word
                    </button>
                  )}
                </span>
              </>
            )}
          </span>
        );
      })}
    </span>
  );
}
