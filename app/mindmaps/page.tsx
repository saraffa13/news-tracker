"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

interface MindMapSummary {
  id: string;
  title: string;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MindMapsPage() {
  const [maps, setMaps] = useState<MindMapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/mindmaps")
      .then((r) => r.json())
      .then(setMaps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const title = newTitle.trim() || "Untitled Mind Map";
    try {
      const res = await fetch("/api/mindmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/mindmaps/${data.id}`);
      } else {
        showToast("Failed to create", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this mind map?")) return;
    try {
      const res = await fetch(`/api/mindmaps/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMaps((prev) => prev.filter((m) => m.id !== id));
        showToast("Mind map deleted", "success");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mind Maps</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Visual maps to organize your understanding
          </p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
        >
          {creating ? "Cancel" : "+ New Mind Map"}
        </button>
      </div>

      {creating && (
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Mind map title..."
            autoFocus
            className="flex-1 px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90"
          >
            Create
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : maps.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="mx-auto mb-4 text-[var(--text-secondary)]"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="4" cy="6" r="2" />
            <circle cx="20" cy="6" r="2" />
            <circle cx="4" cy="18" r="2" />
            <circle cx="20" cy="18" r="2" />
            <line x1="9.5" y1="10" x2="5.5" y2="7.5" />
            <line x1="14.5" y1="10" x2="18.5" y2="7.5" />
            <line x1="9.5" y1="14" x2="5.5" y2="16.5" />
            <line x1="14.5" y1="14" x2="18.5" y2="16.5" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No mind maps yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Create your first mind map to visually organize topics.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90"
          >
            Create Mind Map
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((m) => (
            <div
              key={m.id}
              className="relative rounded-xl bg-[var(--card)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors group"
            >
              <Link href={`/mindmaps/${m.id}`} className="block p-5">
                <h3 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors mb-2">
                  {m.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {m.nodeCount} nodes
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Updated {formatDate(m.updatedAt)}
                </p>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(m.id);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
