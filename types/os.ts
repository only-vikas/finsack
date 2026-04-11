import type { LucideIcon } from "lucide-react";

// ─── Window Management ──────────────────────────────────────────────────────

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

// ─── Application Registry ───────────────────────────────────────────────────

export interface AppDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  component: React.ComponentType<AppComponentProps>;
  defaultSize: { width: number; height: number };
  dockOrder: number;
  accentColor: string;
}

export interface AppComponentProps {
  windowId: string;
}

// ─── Strategy / FinLearn ────────────────────────────────────────────────────

export type StrategyCategory =
  | "investing"
  | "swing-trading"
  | "options-trading";

export interface Strategy {
  id: string;
  category: StrategyCategory;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  xpReward: number;
  ytSearchTag: string;
  aiPrompt: string;
  description: string;
}

// ─── User Progress ──────────────────────────────────────────────────────────

export interface UserProgress {
  xp: number;
  streak: number;
  completedLessons: string[];
  lastActiveDate: string;
}

// ─── AI / Chat ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

// ─── YouTube ────────────────────────────────────────────────────────────────

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
}
