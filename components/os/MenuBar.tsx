"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Zap, Flame, Sparkles } from "lucide-react";

export function MenuBar() {
  const { progress } = useUser();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const dayName = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="menubar">
      {/* Left — branding + user stats */}
      <div className="menubar-left">
        <span className="menubar-logo">
          <Sparkles size={14} className="menubar-logo-icon" />
          FinSack
        </span>

        <div className="menubar-divider" />

        <div className="menubar-stat" title="Experience Points">
          <Zap size={12} className="text-cyan-400" />
          <span>{progress.xp.toLocaleString()} XP</span>
        </div>

        <div className="menubar-stat" title="Day Streak">
          <Flame size={12} className="text-orange-400" />
          <span>{progress.streak}d</span>
        </div>
      </div>

      {/* Right — clock */}
      <div className="menubar-right">
        <span className="menubar-date">{dayName}</span>
        <span className="menubar-time">{time}</span>
      </div>
    </header>
  );
}
