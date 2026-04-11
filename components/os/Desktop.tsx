"use client";

import React from "react";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { DraggableWindow } from "./DraggableWindow";
import { useWindows } from "@/context/WindowContext";

import FinLearn from "@/components/apps/FinLearn";
import MarketPulse from "@/components/apps/MarketPulse";
import NovaTerminal from "@/components/apps/NovaTerminal";

// ─── App content resolver ───────────────────────────────────────────────────

const APP_COMPONENTS: Record<string, React.ComponentType<{ windowId: string }>> = {
  finlearn: FinLearn,
  marketpulse: MarketPulse,
  nova: NovaTerminal,
};

export default function Desktop() {
  const { windows } = useWindows();

  return (
    <div className="desktop-root">
      {/* Nebula background */}
      <div className="desktop-bg" />

      {/* Grid overlay */}
      <div className="desktop-grid" />

      {/* Menu bar */}
      <MenuBar />

      {/* Windows layer */}
      <div className="windows-layer">
        {windows
          .filter((w) => w.isOpen && !w.isMinimized)
          .map((win) => {
            const AppComp = APP_COMPONENTS[win.appId];
            if (!AppComp) return null;
            return (
              <DraggableWindow key={win.id} windowState={win}>
                <AppComp windowId={win.id} />
              </DraggableWindow>
            );
          })}
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
}
