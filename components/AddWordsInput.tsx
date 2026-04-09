"use client";

import { useState } from "react";
import type { DifficultWord } from "@/types";

export default function AddWordsInput({
  articleId,
  articleText,
  date,
  onWordsAdded,
}: {
  articleId: string;
  articleText: string;
  date: string;
  onWordsAdded: (words: DifficultWord[]) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const raw = input.trim();
    if (!raw) return;

    // Parse words: split by comma, newline, or multiple spaces
    const words = raw
      .split(/[,\n]+/)
      .map((w) => w.trim())
      .filter(Boolean);

    if (words.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/words/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, articleId, words, articleText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate");
      }

      const data = await res.json();
      onWordsAdded(data.words);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add words: brinkmanship, elusive, spectre..."
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3m6.36-.64l-2.12 2.12M21 12h-3m.64 6.36l-2.12-2.12M12 21v-3m-6.36.64l2.12-2.12M3 12h3m-.64-6.36l2.12 2.12" />
              </svg>
              Get Meanings
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
    </div>
  );
}
