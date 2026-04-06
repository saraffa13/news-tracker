"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DrawingCanvas from "./DrawingCanvas";

export default function CanvasSection({
  canvasData,
  onSave,
}: {
  canvasData: string;
  onSave?: (data: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Preview / trigger */}
      <div
        onClick={() => onSave && setOpen(true)}
        className={`rounded-lg border border-[var(--border-color)] bg-white overflow-hidden min-h-[200px] h-full flex items-center justify-center ${
          onSave ? "cursor-pointer hover:border-[var(--accent)] transition-colors" : ""
        }`}
      >
        {canvasData ? (
          <img
            src={canvasData}
            alt="Canvas drawing"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span className="text-xs mt-2">Click to draw</span>
          </div>
        )}
      </div>

      {/* Canvas overlay — portaled to body so nothing can overlap it */}
      {open && onSave && mounted && createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}
          className="flex items-center justify-center bg-black/50 p-6 sm:p-10"
        >
          <div className="w-full h-full rounded-xl overflow-hidden border border-[var(--border-color)] shadow-2xl flex flex-col bg-[var(--bg)]">
            <DrawingCanvas
              canvasData={canvasData}
              onSave={(data) => {
                onSave(data);
              }}
              onClose={(finalData) => {
                if (finalData) onSave(finalData);
                setOpen(false);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
