"use client";

import { useState, useRef, useEffect } from "react";

interface DrawingCanvasProps {
  canvasData: string;
  onSave: (data: string) => void;
  onClose: (data?: string) => void;
}

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ffffff"];
const SIZES = [2, 4, 8, 14];

export default function DrawingCanvas({
  canvasData,
  onSave,
  onClose,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  // Only run once on mount: set canvas size and load saved data
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || initializedRef.current) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasData;
    }

    initializedRef.current = true;
  }, [canvasData]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    return canvas.toDataURL("image/jpeg", 0.5);
  };

  const handleSave = () => {
    const data = getCanvasData();
    if (data) onSave(data);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--card)] border-b border-[var(--border-color)] flex-wrap">
        {/* Tools */}
        <div className="flex gap-1">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              tool === "pen"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
            }`}
            title="Pen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              tool === "eraser"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
            }`}
            title="Eraser"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </svg>
          </button>
        </div>

        <div className="w-px h-5 bg-[var(--border-color)]" />

        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c && tool === "pen" ? "scale-125 border-[var(--accent)]" : "border-[var(--border-color)]"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-[var(--border-color)]" />

        {/* Sizes */}
        <div className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                size === s ? "bg-[var(--accent)]" : "hover:bg-[var(--border-color)]"
              }`}
            >
              <div
                className="rounded-full"
                style={{
                  width: Math.min(s + 2, 14),
                  height: Math.min(s + 2, 14),
                  backgroundColor: size === s ? "white" : "var(--text-secondary)",
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleClear}
          className="px-2 py-1 text-xs rounded-md text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Save
        </button>
        <button
          onClick={() => {
            onClose(getCanvasData());
          }}
          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--border-color)] transition-colors"
          title="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  );
}
