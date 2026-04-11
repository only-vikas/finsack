"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { UserProgress } from "@/types/os";

interface UserActions {
  progress: UserProgress;
  addXp: (amount: number) => void;
  completeLesson: (strategyId: string) => void;
  isLessonComplete: (strategyId: string) => boolean;
}

const UserContext = createContext<UserActions | null>(null);

export function useUser(): UserActions {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}

const STORAGE_KEY = "finsack_user_progress";

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 1,
  completedLessons: [],
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as UserProgress;

    // Streak logic: if last active was yesterday, increment; if today, keep; else reset
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = parsed.lastActiveDate;
    if (lastDate === today) return parsed;

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    if (lastDate === yesterday) {
      return { ...parsed, streak: parsed.streak + 1, lastActiveDate: today };
    }
    return { ...parsed, streak: 1, lastActiveDate: today };
  } catch {
    return defaultProgress;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const addXp = useCallback((amount: number) => {
    setProgress((p) => ({ ...p, xp: p.xp + amount }));
  }, []);

  const completeLesson = useCallback(
    (strategyId: string) => {
      setProgress((p) => {
        if (p.completedLessons.includes(strategyId)) return p;
        return {
          ...p,
          completedLessons: [...p.completedLessons, strategyId],
        };
      });
    },
    []
  );

  const isLessonComplete = useCallback(
    (strategyId: string) => progress.completedLessons.includes(strategyId),
    [progress.completedLessons]
  );

  return (
    <UserContext.Provider
      value={{ progress, addXp, completeLesson, isLessonComplete }}
    >
      {children}
    </UserContext.Provider>
  );
}
