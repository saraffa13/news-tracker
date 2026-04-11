"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MindMapEditor from "@/components/MindMapEditor";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  shape: "rect" | "circle";
}

interface MindMapEdge {
  id: string;
  from: string;
  to: string;
}

interface MindMapData {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export default function MindMapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<MindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/api/mindmaps/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setTitle(d.title);
      })
      .catch(() => {
        showToast("Mind map not found", "error");
        router.push("/mindmaps");
      })
      .finally(() => setLoading(false));
  }, [id, router, showToast]);

  const handleSave = useCallback(
    async (nodes: MindMapNode[], edges: MindMapEdge[]) => {
      try {
        await fetch(`/api/mindmaps/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });
      } catch {
        showToast("Failed to save", "error");
      }
    },
    [id, showToast]
  );

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== data?.title) {
      try {
        await fetch(`/api/mindmaps/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        });
        setData((prev) => (prev ? { ...prev, title: title.trim() } : prev));
      } catch {
        showToast("Failed to save title", "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this mind map?")) return;
    try {
      const res = await fetch(`/api/mindmaps/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Mind map deleted", "success");
        router.push("/mindmaps");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/mindmaps"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          Mind Maps
        </Link>
        <span className="text-[var(--text-secondary)]">/</span>
        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") {
                setTitle(data.title);
                setEditingTitle(false);
              }
            }}
            autoFocus
            className="text-xl font-bold bg-transparent border-b-2 border-[var(--accent)] outline-none text-[var(--text-primary)] flex-1"
          />
        ) : (
          <h1
            className="text-xl font-bold cursor-pointer hover:text-[var(--accent)] transition-colors flex-1"
            onClick={() => setEditingTitle(true)}
            title="Click to rename"
          >
            {data.title}
          </h1>
        )}
        <button
          onClick={handleDelete}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors"
          title="Delete mind map"
        >
          <svg
            width="18"
            height="18"
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

      {/* Editor */}
      <div className="flex-1 rounded-xl border border-[var(--border-color)] overflow-hidden">
        <MindMapEditor
          initialNodes={data.nodes}
          initialEdges={data.edges}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
