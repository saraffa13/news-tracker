"use client";

import { useState, useRef, useEffect } from "react";

export default function NotesSection({
  notes,
  onSave,
}: {
  notes: string;
  onSave?: (notes: string) => void;
}) {
  const [value, setValue] = useState(notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(notes);
  }, [notes]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (!onSave) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(newValue);
    }, 800);
  };

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card)] min-h-[200px] h-full flex flex-col">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your notes here..."
        readOnly={!onSave}
        className="w-full h-full text-sm px-4 py-3 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none resize-none overflow-y-auto flex-1"
      />
    </div>
  );
}
