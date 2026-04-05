"use client";

import { useState } from "react";

interface JsonInputProps {
  onSubmit: (json: string) => void;
  loading: boolean;
}

export default function JsonInput({ onSubmit, loading }: JsonInputProps) {
  const [text, setText] = useState("");

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Paste your JSON here... (starts with { "date": "..."}'
        rows={16}
        className="w-full p-4 rounded-lg bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] font-mono text-sm focus:outline-none focus:border-[var(--accent)] resize-y"
      />
      <button
        onClick={() => onSubmit(text)}
        disabled={loading || !text.trim()}
        className="mt-4 px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Submit"}
      </button>
    </div>
  );
}
