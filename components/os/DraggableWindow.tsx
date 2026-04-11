"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { useWindows } from "@/context/WindowContext";
import type { WindowState } from "@/types/os";

// ─── Constants ──────────────────────────────────────────────────────────────

const MENU_BAR_HEIGHT = 36;
const MIN_WIDTH = 420;
const MIN_HEIGHT = 300;

// ─── Resize handle component ───────────────────────────────────────────────

function ResizeHandle({
  direction,
  onResize,
}: {
  direction: "se" | "sw" | "ne" | "nw" | "e" | "w" | "s" | "n";
  onResize: (dx: number, dy: number, dir: string) => void;
}) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;

      const onMove = (ev: PointerEvent) => {
        onResize(ev.clientX - startX, ev.clientY - startY, direction);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [direction, onResize]
  );

  const cursorMap: Record<string, string> = {
    se: "nwse-resize",
    sw: "nesw-resize",
    ne: "nesw-resize",
    nw: "nwse-resize",
    e: "ew-resize",
    w: "ew-resize",
    s: "ns-resize",
    n: "ns-resize",
  };

  const posMap: Record<string, React.CSSProperties> = {
    se: { bottom: 0, right: 0, width: 16, height: 16 },
    sw: { bottom: 0, left: 0, width: 16, height: 16 },
    ne: { top: 0, right: 0, width: 16, height: 16 },
    nw: { top: 0, left: 0, width: 16, height: 16 },
    e: { top: 16, right: 0, bottom: 16, width: 6 },
    w: { top: 16, left: 0, bottom: 16, width: 6 },
    s: { bottom: 0, left: 16, right: 16, height: 6 },
    n: { top: 0, left: 16, right: 16, height: 6 },
  };

  return (
    <div
      className="resize-handle"
      style={{ ...posMap[direction], cursor: cursorMap[direction] }}
      onPointerDown={handlePointerDown}
    />
  );
}

// ─── DraggableWindow ────────────────────────────────────────────────────────

export function DraggableWindow({
  windowState,
  children,
}: {
  windowState: WindowState;
  children: React.ReactNode;
}) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
  } = useWindows();

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const sizeRef = useRef(windowState.size);
  const posRef = useRef(windowState.position);

  // Keep refs in sync
  useEffect(() => {
    sizeRef.current = windowState.size;
    posRef.current = windowState.position;
  }, [windowState.size, windowState.position]);

  // ── Title bar drag ────────────────────────────────────────────────────
  const onTitlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (windowState.isMaximized) return;
      e.preventDefault();
      focusWindow(windowState.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = posRef.current.x;
      const origY = posRef.current.y;

      const onMove = (ev: PointerEvent) => {
        const newX = origX + (ev.clientX - startX);
        const newY = Math.max(
          MENU_BAR_HEIGHT,
          origY + (ev.clientY - startY)
        );
        updatePosition(windowState.id, { x: newX, y: newY });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [windowState.id, windowState.isMaximized, focusWindow, updatePosition]
  );

  // ── Resize ────────────────────────────────────────────────────────────
  const [resizeOrigin, setResizeOrigin] = useState<{
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);

  const onResize = useCallback(
    (dx: number, dy: number, dir: string) => {
      const orig = resizeOrigin ?? {
        w: sizeRef.current.width,
        h: sizeRef.current.height,
        x: posRef.current.x,
        y: posRef.current.y,
      };
      if (!resizeOrigin) setResizeOrigin(orig);

      let newW = orig.w;
      let newH = orig.h;
      let newX = orig.x;
      let newY = orig.y;

      if (dir.includes("e")) newW = Math.max(MIN_WIDTH, orig.w + dx);
      if (dir.includes("w")) {
        newW = Math.max(MIN_WIDTH, orig.w - dx);
        newX = orig.x + (orig.w - newW);
      }
      if (dir.includes("s")) newH = Math.max(MIN_HEIGHT, orig.h + dy);
      if (dir.includes("n")) {
        newH = Math.max(MIN_HEIGHT, orig.h - dy);
        newY = Math.max(MENU_BAR_HEIGHT, orig.y + (orig.h - newH));
      }

      updateSize(windowState.id, { width: newW, height: newH });
      updatePosition(windowState.id, { x: newX, y: newY });
    },
    [windowState.id, resizeOrigin, updateSize, updatePosition]
  );

  // Reset resize origin on pointer up
  useEffect(() => {
    const onUp = () => setResizeOrigin(null);
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  // ── Style computation ─────────────────────────────────────────────────
  const isMax = windowState.isMaximized;

  const style: React.CSSProperties = isMax
    ? {
        top: MENU_BAR_HEIGHT,
        left: 0,
        width: "100vw",
        height: `calc(100vh - ${MENU_BAR_HEIGHT}px - 80px)`,
        zIndex: windowState.zIndex,
        borderRadius: 0,
      }
    : {
        top: windowState.position.y,
        left: windowState.position.x,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
      };

  // ── Accent color by app type ──────────────────────────────────────────
  const accentMap: Record<string, string> = {
    finlearn: "#22d3ee",
    marketpulse: "#a78bfa",
    nova: "#34d399",
  };
  const accent = accentMap[windowState.appId] ?? "#60a5fa";

  return (
    <motion.div
      className="window-frame"
      style={style}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onPointerDown={() => focusWindow(windowState.id)}
    >
      {/* Title bar */}
      <div
        className="window-titlebar"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => maximizeWindow(windowState.id)}
        style={{ borderBottom: `1px solid ${accent}15` }}
      >
        {/* Traffic lights */}
        <div className="window-controls">
          <button
            className="window-btn window-btn-close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowState.id);
            }}
            aria-label="Close"
          >
            <X size={8} />
          </button>
          <button
            className="window-btn window-btn-minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowState.id);
            }}
            aria-label="Minimize"
          >
            <Minus size={8} />
          </button>
          <button
            className="window-btn window-btn-maximize"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(windowState.id);
            }}
            aria-label="Maximize"
          >
            <Maximize2 size={8} />
          </button>
        </div>

        {/* Title */}
        <span className="window-title" style={{ color: accent }}>
          {windowState.title}
        </span>

        <div className="window-titlebar-spacer" />
      </div>

      {/* Content */}
      <div className="window-content">{children}</div>

      {/* Resize handles (not when maximized) */}
      {!isMax && (
        <>
          <ResizeHandle direction="se" onResize={onResize} />
          <ResizeHandle direction="sw" onResize={onResize} />
          <ResizeHandle direction="ne" onResize={onResize} />
          <ResizeHandle direction="nw" onResize={onResize} />
          <ResizeHandle direction="e" onResize={onResize} />
          <ResizeHandle direction="w" onResize={onResize} />
          <ResizeHandle direction="s" onResize={onResize} />
          <ResizeHandle direction="n" onResize={onResize} />
        </>
      )}
    </motion.div>
  );
}
