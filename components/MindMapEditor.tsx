"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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

const COLORS = [
  "#4a72b0",
  "#e74c3c",
  "#27ae60",
  "#f39c12",
  "#8e44ad",
  "#1abc9c",
  "#e67e22",
  "#2c3e50",
];

let idCounter = 0;
function genId() {
  return `n${Date.now()}_${idCounter++}`;
}

function getNodeCenter(n: MindMapNode) {
  return { cx: n.x + n.width / 2, cy: n.y + n.height / 2 };
}

type ResizeDir = "e" | "w" | "s" | "n" | "se" | "sw" | "ne" | "nw";

export default function MindMapEditor({
  initialNodes,
  initialEdges,
  onSave,
}: {
  initialNodes: MindMapNode[];
  initialEdges: MindMapEdge[];
  onSave: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
}) {
  const [nodes, setNodes] = useState<MindMapNode[]>(
    initialNodes.map((n) => ({ ...n, shape: n.shape || "rect" }))
  );
  const [edges, setEdges] = useState<MindMapEdge[]>(initialEdges);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedShape, setSelectedShape] = useState<"rect" | "circle">("rect");
  const [zoom, setZoom] = useState(1);
  const [resizing, setResizing] = useState<{
    nodeId: string;
    dir: ResizeDir;
    startX: number;
    startY: number;
    origNode: MindMapNode;
  } | null>(null);
  // Box selection
  const [boxSelect, setBoxSelect] = useState<{ startX: number; startY: number; curX: number; curY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const dirty = useRef(false);

  // Helpers for selection
  const hasSelection = selected.size > 0;
  const singleSelected = selected.size === 1 ? [...selected][0] : null;

  useEffect(() => {
    if (editingNode && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingNode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dirty.current) {
        dirty.current = false;
        onSave(nodes, edges);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [nodes, edges, onSave]);

  const markDirty = useCallback(() => {
    dirty.current = true;
  }, []);

  const getSvgPoint = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as SVGElement).tagName === "svg") {
        if (e.shiftKey) {
          // Start box selection
          const pt = getSvgPoint(e);
          setBoxSelect({ startX: pt.x, startY: pt.y, curX: pt.x, curY: pt.y });
          return;
        }
        setSelected(new Set());
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan, getSvgPoint]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (boxSelect) {
        const pt = getSvgPoint(e);
        setBoxSelect((prev) => prev ? { ...prev, curX: pt.x, curY: pt.y } : null);
        return;
      }
      if (resizing) {
        const pt = getSvgPoint(e);
        const dx = pt.x - resizing.startX;
        const dy = pt.y - resizing.startY;
        const o = resizing.origNode;
        const minSize = 40;

        let newX = o.x, newY = o.y, newW = o.width, newH = o.height;

        if (resizing.dir.includes("e")) newW = Math.max(minSize, o.width + dx);
        if (resizing.dir.includes("w")) {
          newW = Math.max(minSize, o.width - dx);
          newX = o.x + (o.width - newW);
        }
        if (resizing.dir.includes("s")) newH = Math.max(minSize, o.height + dy);
        if (resizing.dir.includes("n")) {
          newH = Math.max(minSize, o.height - dy);
          newY = o.y + (o.height - newH);
        }

        if (o.shape === "circle") {
          const size = Math.max(newW, newH);
          if (resizing.dir.includes("w")) newX = o.x + o.width - size;
          if (resizing.dir.includes("n")) newY = o.y + o.height - size;
          newW = size;
          newH = size;
        }

        setNodes((prev) =>
          prev.map((n) =>
            n.id === resizing.nodeId
              ? { ...n, x: newX, y: newY, width: newW, height: newH }
              : n
          )
        );
        markDirty();
        return;
      }
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      if (dragging) {
        const pt = getSvgPoint(e);
        const dragNode = nodes.find((n) => n.id === dragging);
        if (!dragNode) return;
        const dx = pt.x - dragOffset.x - dragNode.x;
        const dy = pt.y - dragOffset.y - dragNode.y;

        // Move all selected nodes together if dragging one of them
        if (selected.has(dragging)) {
          setNodes((prev) =>
            prev.map((n) =>
              selected.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n
            )
          );
        } else {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === dragging ? { ...n, x: pt.x - dragOffset.x, y: pt.y - dragOffset.y } : n
            )
          );
        }
        markDirty();
      }
    },
    [boxSelect, resizing, isPanning, panStart, dragging, dragOffset, getSvgPoint, markDirty, selected, nodes]
  );

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (boxSelect) {
        // Find nodes inside box
        const x1 = Math.min(boxSelect.startX, boxSelect.curX);
        const y1 = Math.min(boxSelect.startY, boxSelect.curY);
        const x2 = Math.max(boxSelect.startX, boxSelect.curX);
        const y2 = Math.max(boxSelect.startY, boxSelect.curY);
        const insideNodes = nodes.filter((n) => {
          const c = getNodeCenter(n);
          return c.cx >= x1 && c.cx <= x2 && c.cy >= y1 && c.cy <= y2;
        });
        if (insideNodes.length > 0) {
          const isCtrl = e.ctrlKey || e.metaKey;
          setSelected((prev) => {
            const next = new Set(isCtrl ? prev : []);
            insideNodes.forEach((n) => next.add(n.id));
            return next;
          });
        }
        setBoxSelect(null);
        return;
      }
      setDragging(null);
      setIsPanning(false);
      setResizing(null);
    },
    [boxSelect, nodes]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(3, Math.max(0.15, zoom * delta));
      setPan({
        x: mx - (mx - pan.x) * (newZoom / zoom),
        y: my - (my - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    },
    [zoom, pan]
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      if (connecting) {
        if (connecting !== nodeId) {
          const edgeExists = edges.some(
            (ed) =>
              (ed.from === connecting && ed.to === nodeId) ||
              (ed.from === nodeId && ed.to === connecting)
          );
          if (!edgeExists) {
            setEdges((prev) => [
              ...prev,
              { id: genId(), from: connecting, to: nodeId },
            ]);
            markDirty();
          }
        }
        setConnecting(null);
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl) {
        // Toggle node in selection
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(nodeId)) next.delete(nodeId);
          else next.add(nodeId);
          return next;
        });
      } else if (!selected.has(nodeId)) {
        // Replace selection with this node
        setSelected(new Set([nodeId]));
      }
      // If already in selection and not ctrl, keep selection (for group drag)

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const pt = getSvgPoint(e);
        setDragOffset({ x: pt.x - node.x, y: pt.y - node.y });
        setDragging(nodeId);
      }
    },
    [connecting, edges, nodes, getSvgPoint, markDirty, selected]
  );

  const handleNodeDoubleClick = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelected(new Set([nodeId]));
        setEditingNode(nodeId);
        setEditText(node.text);
      }
    },
    [nodes]
  );

  const commitEdit = useCallback(() => {
    if (editingNode) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNode ? { ...n, text: editText } : n))
      );
      setEditingNode(null);
      markDirty();
    }
  }, [editingNode, editText, markDirty]);

  const addNode = useCallback(
    (shape: "rect" | "circle") => {
      const anchor = singleSelected ? nodes.find((n) => n.id === singleSelected) : null;
      const size = shape === "circle" ? 100 : 160;
      const h = shape === "circle" ? 100 : 60;
      const baseX = anchor ? anchor.x + anchor.width + 60 : 400 - pan.x;
      const baseY = anchor ? anchor.y + (anchor.height - h) / 2 : 300 - pan.y;
      const newNode: MindMapNode = {
        id: genId(),
        text: "New Topic",
        x: baseX,
        y: baseY,
        color: selectedColor,
        width: size,
        height: h,
        shape,
      };
      setNodes((prev) => [...prev, newNode]);
      if (singleSelected) {
        setEdges((prev) => [
          ...prev,
          { id: genId(), from: singleSelected, to: newNode.id },
        ]);
      }
      setSelected(new Set([newNode.id]));
      setEditingNode(newNode.id);
      setEditText("New Topic");
      markDirty();
    },
    [nodes, singleSelected, selectedColor, pan, markDirty]
  );

  const deleteSelected = useCallback(() => {
    if (!hasSelection) return;
    setNodes((prev) => prev.filter((n) => !selected.has(n.id)));
    setEdges((prev) =>
      prev.filter((e) => !selected.has(e.from) && !selected.has(e.to))
    );
    setSelected(new Set());
    markDirty();
  }, [selected, hasSelection, markDirty]);

  // Keyboard Delete/Backspace
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingNode) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        deleteSelected();
      }
      // Ctrl+A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setSelected(new Set(nodes.map((n) => n.id)));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected, editingNode, nodes]);

  const changeColor = useCallback(
    (color: string) => {
      setSelectedColor(color);
      if (hasSelection) {
        setNodes((prev) =>
          prev.map((n) => (selected.has(n.id) ? { ...n, color } : n))
        );
        markDirty();
      }
    },
    [selected, hasSelection, markDirty]
  );

  const toggleShape = useCallback(() => {
    if (!hasSelection) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (!selected.has(n.id)) return n;
        const newShape = n.shape === "rect" ? "circle" : "rect";
        if (newShape === "circle") {
          const size = Math.max(n.width, n.height);
          return { ...n, shape: newShape, width: size, height: size };
        }
        return { ...n, shape: newShape, height: Math.min(n.height, n.width * 0.4) };
      })
    );
    markDirty();
  }, [selected, hasSelection, markDirty]);

  const startConnect = useCallback(() => {
    if (singleSelected) setConnecting(singleSelected);
  }, [singleSelected]);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string, dir: ResizeDir) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const pt = getSvgPoint(e);
      setResizing({ nodeId, dir, startX: pt.x, startY: pt.y, origNode: { ...node } });
    },
    [nodes, getSvgPoint]
  );

  const handleSvgDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== svgRef.current && (e.target as SVGElement).closest("g")) return;
      const pt = getSvgPoint(e);
      const size = selectedShape === "circle" ? 100 : 160;
      const h = selectedShape === "circle" ? 100 : 60;
      const newNode: MindMapNode = {
        id: genId(),
        text: "New Topic",
        x: pt.x - size / 2,
        y: pt.y - h / 2,
        color: selectedColor,
        width: size,
        height: h,
        shape: selectedShape,
      };
      setNodes((prev) => [...prev, newNode]);
      setSelected(new Set([newNode.id]));
      setEditingNode(newNode.id);
      setEditText("New Topic");
      markDirty();
    },
    [getSvgPoint, selectedColor, selectedShape, markDirty]
  );

  const forceSave = useCallback(() => {
    dirty.current = false;
    onSave(nodes, edges);
  }, [nodes, edges, onSave]);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const getResizeHandles = (node: MindMapNode): { dir: ResizeDir; x: number; y: number; cursor: string }[] => {
    const { x, y, width: w, height: h } = node;
    return [
      { dir: "nw", x, y, cursor: "nwse-resize" },
      { dir: "n", x: x + w / 2, y, cursor: "ns-resize" },
      { dir: "ne", x: x + w, y, cursor: "nesw-resize" },
      { dir: "e", x: x + w, y: y + h / 2, cursor: "ew-resize" },
      { dir: "se", x: x + w, y: y + h, cursor: "nwse-resize" },
      { dir: "s", x: x + w / 2, y: y + h, cursor: "ns-resize" },
      { dir: "sw", x, y: y + h, cursor: "nesw-resize" },
      { dir: "w", x, y: y + h / 2, cursor: "ew-resize" },
    ];
  };

  const singleSelectedData = singleSelected ? nodeMap.get(singleSelected) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[var(--card)] border-b border-[var(--border-color)]">
        <button
          onClick={() => addNode("rect")}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="10" rx="2" />
          </svg>
          Rectangle
        </button>
        <button
          onClick={() => addNode("circle")}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="7" />
          </svg>
          Circle
        </button>
        {hasSelection && (
          <button
            onClick={toggleShape}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Toggle shape of selected nodes"
          >
            Toggle Shape
          </button>
        )}
        <span className="mx-0.5 text-[var(--border-color)]">|</span>
        <button
          onClick={startConnect}
          disabled={!singleSelected}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            connecting
              ? "bg-green-600 text-white"
              : "bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          } disabled:opacity-30`}
        >
          {connecting ? "Click target..." : "Connect"}
        </button>
        {connecting && (
          <button
            onClick={() => setConnecting(null)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white"
          >
            Cancel
          </button>
        )}
        <button
          onClick={deleteSelected}
          disabled={!hasSelection}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-30"
        >
          Delete{selected.size > 1 ? ` (${selected.size})` : ""}
        </button>
        <span className="mx-0.5 text-[var(--border-color)]">|</span>
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => changeColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                selectedColor === c ? "border-white scale-125" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="mx-0.5 text-[var(--border-color)]">|</span>
        <div className="flex gap-1 items-center">
          <span className="text-[10px] text-[var(--text-secondary)]">Default:</span>
          <button
            onClick={() => setSelectedShape("rect")}
            className={`p-1 rounded ${selectedShape === "rect" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)]"}`}
            title="Default shape: rectangle"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="14" height="10" rx="2" />
            </svg>
          </button>
          <button
            onClick={() => setSelectedShape("circle")}
            className={`p-1 rounded ${selectedShape === "circle" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)]"}`}
            title="Default shape: circle"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" />
            </svg>
          </button>
        </div>
        <span className="mx-0.5 text-[var(--border-color)]">|</span>
        <button
          onClick={forceSave}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Save
        </button>
        <span className="mx-0.5 text-[var(--border-color)]">|</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const newZoom = Math.max(0.15, zoom - 0.15);
              setPan({ x: pan.x + (zoom - newZoom) * 400, y: pan.y + (zoom - newZoom) * 300 });
              setZoom(newZoom);
            }}
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Zoom out"
          >
            -
          </button>
          <input
            type="text"
            value={`${Math.round(zoom * 100)}%`}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              const pct = parseInt(raw, 10);
              if (!isNaN(pct) && pct >= 15 && pct <= 300) {
                setZoom(pct / 100);
              }
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            onDoubleClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-[3.2rem] px-1 py-0.5 rounded text-[10px] font-medium bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] text-center outline-none focus:border-[var(--accent)] focus:text-[var(--text-primary)]"
            title="Type zoom % (15-300). Double-click to reset."
          />
          <button
            onClick={() => {
              const newZoom = Math.min(3, zoom + 0.15);
              setPan({ x: pan.x - (newZoom - zoom) * 400, y: pan.y - (newZoom - zoom) * 300 });
              setZoom(newZoom);
            }}
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Zoom in"
          >
            +
          </button>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)] ml-auto">
          {selected.size > 1
            ? `${selected.size} selected`
            : singleSelectedData
              ? `${Math.round(singleSelectedData.width)} x ${Math.round(singleSelectedData.height)}`
              : "Ctrl+click or Shift+drag to multi-select. Ctrl+A select all."}
        </span>
      </div>

      {/* Canvas */}
      <svg
        ref={svgRef}
        className="flex-1 bg-[var(--bg)]"
        style={{ minHeight: 500, cursor: isPanning ? "grabbing" : resizing ? "default" : boxSelect ? "crosshair" : "grab" }}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
        onDoubleClick={handleSvgDoubleClick}
        onWheel={handleWheel}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;
            const c1 = getNodeCenter(fromNode);
            const c2 = getNodeCenter(toNode);
            return (
              <line
                key={edge.id}
                x1={c1.cx}
                y1={c1.cy}
                x2={c2.cx}
                y2={c2.cy}
                stroke="var(--text-secondary)"
                strokeWidth={2}
                strokeOpacity={0.4}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selected.has(node.id);
            const isEditing = editingNode === node.id;
            const center = getNodeCenter(node);

            return (
              <g
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
                style={{ cursor: connecting ? "crosshair" : dragging === node.id ? "grabbing" : "pointer" }}
              >
                {node.shape === "circle" ? (
                  <ellipse
                    cx={center.cx}
                    cy={center.cy}
                    rx={node.width / 2}
                    ry={node.height / 2}
                    fill={node.color}
                    fillOpacity={0.9}
                    stroke={isSelected ? "#fff" : "transparent"}
                    strokeWidth={isSelected ? 2.5 : 0}
                  />
                ) : (
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={12}
                    fill={node.color}
                    fillOpacity={0.9}
                    stroke={isSelected ? "#fff" : "transparent"}
                    strokeWidth={isSelected ? 2.5 : 0}
                  />
                )}

                {isEditing ? (
                  <foreignObject
                    x={node.x + 8}
                    y={node.y + 8}
                    width={node.width - 16}
                    height={node.height - 16}
                  >
                    <input
                      ref={editRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditingNode(null);
                      }}
                      className="w-full h-full bg-transparent text-white text-center text-sm font-medium outline-none border-b border-white/50"
                      style={{ lineHeight: `${node.height - 16}px` }}
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={center.cx}
                    y={center.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontSize={Math.min(14, Math.max(10, node.width / 12))}
                    fontWeight={600}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.text.length > Math.floor(node.width / 8)
                      ? node.text.slice(0, Math.floor(node.width / 8) - 2) + "..."
                      : node.text}
                  </text>
                )}
              </g>
            );
          })}

          {/* Resize handles — only for single selection */}
          {singleSelected && !dragging && !connecting && singleSelectedData && (
            <>
              {getResizeHandles(singleSelectedData).map((h) => (
                <circle
                  key={h.dir}
                  cx={h.x}
                  cy={h.y}
                  r={5}
                  fill="#fff"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  style={{ cursor: h.cursor }}
                  onMouseDown={(e) => handleResizeMouseDown(e, singleSelected, h.dir)}
                />
              ))}
            </>
          )}

          {/* Box selection rectangle */}
          {boxSelect && (
            <rect
              x={Math.min(boxSelect.startX, boxSelect.curX)}
              y={Math.min(boxSelect.startY, boxSelect.curY)}
              width={Math.abs(boxSelect.curX - boxSelect.startX)}
              height={Math.abs(boxSelect.curY - boxSelect.startY)}
              fill="var(--accent)"
              fillOpacity={0.1}
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          )}

          {/* Connection line preview */}
          {connecting && nodeMap.get(connecting) && (
            <ConnectingLine
              fromNode={nodeMap.get(connecting)!}
              svgRef={svgRef}
              pan={pan}
              zoom={zoom}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

function ConnectingLine({
  fromNode,
  svgRef,
  pan,
  zoom,
}: {
  fromNode: MindMapNode;
  svgRef: React.RefObject<SVGSVGElement | null>;
  pan: { x: number; y: number };
  zoom: number;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setMouse({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        });
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [svgRef, pan, zoom]);

  const c = getNodeCenter(fromNode);

  return (
    <line
      x1={c.cx}
      y1={c.cy}
      x2={mouse.x}
      y2={mouse.y}
      stroke="#27ae60"
      strokeWidth={2}
      strokeDasharray="6 4"
      strokeOpacity={0.7}
    />
  );
}
