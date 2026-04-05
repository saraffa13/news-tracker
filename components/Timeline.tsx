"use client";

import { useState } from "react";
import type { KeyDate } from "@/types";

function formatTimelineDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Timeline({ dates }: { dates: KeyDate[] }) {
  const [open, setOpen] = useState(false);

  if (!dates || dates.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline mb-2"
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Key Dates ({dates.length})
      </button>

      {open && (
        <div className="relative pl-5 mt-1">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-1.5 bottom-1.5 w-px"
            style={{ backgroundColor: "var(--border-color)" }}
          />

          <div className="space-y-3">
            {dates.map((entry, idx) => {
              const isLast = idx === dates.length - 1;
              return (
                <div key={idx} className="relative flex gap-3 items-start">
                  {/* Dot */}
                  <div
                    className="absolute -left-5 top-1.5 w-[15px] h-[15px] rounded-full border-2 flex-shrink-0"
                    style={{
                      borderColor: "var(--accent)",
                      backgroundColor: isLast ? "var(--accent)" : "var(--card)",
                      boxShadow: isLast
                        ? "0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent)"
                        : "none",
                    }}
                  />
                  {/* Content */}
                  <div className="min-w-0 pb-0.5">
                    <span className="text-xs font-medium text-[var(--text-secondary)] mr-2 whitespace-nowrap">
                      {formatTimelineDate(entry.date)}
                    </span>
                    <span className={`text-sm ${isLast ? "font-medium" : ""}`}>
                      {entry.event}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
