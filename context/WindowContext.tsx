"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { WindowState } from "@/types/os";

// ─── App registry mapping ───────────────────────────────────────────────────

interface WindowActions {
  windows: WindowState[];
  openWindow: (appId: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, pos: { x: number; y: number }) => void;
  updateSize: (
    id: string,
    size: { width: number; height: number }
  ) => void;
}

const WindowContext = createContext<WindowActions | null>(null);

export function useWindows(): WindowActions {
  const ctx = useContext(WindowContext);
  if (!ctx)
    throw new Error("useWindows must be used within <WindowProvider>");
  return ctx;
}

// ─── Default sizes per app ──────────────────────────────────────────────────

const APP_DEFAULTS: Record<
  string,
  { title: string; width: number; height: number }
> = {
  finlearn: { title: "FinLearn", width: 1050, height: 680 },
  marketpulse: { title: "MarketPulse", width: 900, height: 620 },
  nova: { title: "Nova Terminal", width: 700, height: 540 },
};

// ─── Provider ───────────────────────────────────────────────────────────────

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const topZ = useRef(100);

  // ── Open / focus ────────────────────────────────────────────────────────
  const openWindow = useCallback((appId: string) => {
    setWindows((prev) => {
      // If already open → focus it
      const existing = prev.find(
        (w) => w.appId === appId && !w.isMinimized
      );
      if (existing) {
        topZ.current += 1;
        return prev.map((w) =>
          w.id === existing.id
            ? { ...w, zIndex: topZ.current, isMinimized: false }
            : w
        );
      }

      // If minimized → restore
      const minimized = prev.find(
        (w) => w.appId === appId && w.isMinimized
      );
      if (minimized) {
        topZ.current += 1;
        return prev.map((w) =>
          w.id === minimized.id
            ? { ...w, zIndex: topZ.current, isMinimized: false }
            : w
        );
      }

      // New window
      const defaults = APP_DEFAULTS[appId] ?? {
        title: appId,
        width: 800,
        height: 560,
      };

      const screenW =
        typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH =
        typeof window !== "undefined" ? window.innerHeight : 800;

      const w = Math.min(defaults.width, screenW - 80);
      const h = Math.min(defaults.height, screenH - 120);

      // Cascade new windows diagonally
      const stepSize = 30;
      const idx = prev.length % 6;
      const x = 80 + idx * stepSize;
      const y = 60 + idx * stepSize;

      topZ.current += 1;

      const newWin: WindowState = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: defaults.title,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x, y },
        size: { width: w, height: h },
        zIndex: topZ.current,
      };

      return [...prev, newWin];
    });
  }, []);

  // ── Close ───────────────────────────────────────────────────────────────
  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ── Minimize ────────────────────────────────────────────────────────────
  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  // ── Maximize toggle ─────────────────────────────────────────────────────
  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  // ── Focus (bring to front) ──────────────────────────────────────────────
  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      topZ.current += 1;
      return prev.map((w) =>
        w.id === id ? { ...w, zIndex: topZ.current } : w
      );
    });
  }, []);

  // ── Update position (drag) ─────────────────────────────────────────────
  const updatePosition = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, position: pos } : w))
      );
    },
    []
  );

  // ── Update size (resize) ───────────────────────────────────────────────
  const updateSize = useCallback(
    (id: string, size: { width: number; height: number }) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, size } : w))
      );
    },
    []
  );

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updatePosition,
        updateSize,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}
