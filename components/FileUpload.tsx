"use client";

import { useCallback, useState } from "react";

interface FileUploadProps {
  onSubmit: (json: string) => void;
  loading: boolean;
}

export default function FileUpload({ onSubmit, loading }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("Please upload a .json file");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)] bg-opacity-5"
            : "border-[var(--border-color)]"
        }`}
      >
        <svg
          className="mx-auto mb-4 text-[var(--text-secondary)]"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-[var(--text-secondary)] mb-2">
          Drag & drop a .json file here, or
        </p>
        <label className="inline-block px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
          Browse Files
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
        {fileName && (
          <p className="mt-4 text-sm text-[var(--accent)] font-medium">
            Selected: {fileName}
          </p>
        )}
      </div>
      {content && (
        <button
          onClick={() => onSubmit(content)}
          disabled={loading}
          className="mt-4 px-6 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Upload & Save"}
        </button>
      )}
    </div>
  );
}
