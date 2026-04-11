"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BookOpen, BarChart3, Terminal, type LucideIcon } from "lucide-react";
import { useWindows } from "@/context/WindowContext";

// ─── Dock item config ───────────────────────────────────────────────────────

const DOCK_APPS: {
  id: string;
  label: string;
  Icon: LucideIcon;
  accentColor: string;
}[] = [
  { id: "finlearn", label: "FinLearn", Icon: BookOpen, accentColor: "#22d3ee" },
  {
    id: "marketpulse",
    label: "MarketPulse",
    Icon: BarChart3,
    accentColor: "#a78bfa",
  },
  { id: "nova", label: "Nova Terminal", Icon: Terminal, accentColor: "#34d399" },
];

// ─── Single Dock Icon (magnification logic) ─────────────────────────────────

function DockIcon({
  id,
  label,
  Icon,
  accentColor,
  mouseX,
  isOpen,
  onClick,
}: {
  id: string;
  label: string;
  Icon: LucideIcon;
  accentColor: string;
  mouseX: MotionValue<number>;
  isOpen: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Distance from cursor to icon center
  const distance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 200;
    return val - (rect.left + rect.width / 2);
  });

  // Map distance → scale:  0px → 1.5x,  150px+ → 1x
  const scaleRaw = useTransform(distance, [-150, 0, 150], [1, 1.5, 1]);
  const scale = useSpring(scaleRaw, { mass: 0.1, stiffness: 200, damping: 15 });

  // Icon size maps with scale
  const iconSize = useTransform(scale, (s: number) => 48 * s);

  return (
    <motion.button
      ref={ref}
      className="dock-icon-btn"
      style={{ scale }}
      onClick={onClick}
      whileTap={{ scale: 1.2 }}
      title={label}
      aria-label={`Open ${label}`}
    >
      <motion.div
        className="dock-icon-inner"
        style={{
          width: iconSize,
          height: iconSize,
          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        <Icon size={24} className="dock-icon-svg" color={accentColor} />
      </motion.div>

      {/* Active indicator dot */}
      {isOpen && (
        <span
          className="dock-active-dot"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Tooltip */}
      <span className="dock-tooltip">{label}</span>
    </motion.button>
  );
}

// ─── Dock Component ─────────────────────────────────────────────────────────

export function Dock() {
  const { windows, openWindow } = useWindows();
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      className="dock"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <div className="dock-inner">
        {DOCK_APPS.map((app) => (
          <DockIcon
            key={app.id}
            id={app.id}
            label={app.label}
            Icon={app.Icon}
            accentColor={app.accentColor}
            mouseX={mouseX}
            isOpen={windows.some(
              (w) => w.appId === app.id && w.isOpen
            )}
            onClick={() => openWindow(app.id)}
          />
        ))}
      </div>
    </motion.nav>
  );
}
