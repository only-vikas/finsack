"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Play,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Loader2,
  Star,
  ArrowLeft,
} from "lucide-react";
import { strategies, categoryInfo } from "@/data/strategies";
import { useUser } from "@/context/UserContext";
import type { Strategy, StrategyCategory } from "@/types/os";

// ─── Main FinLearn Component ────────────────────────────────────────────────

export default function FinLearn({ windowId }: { windowId: string }) {
  const [selectedCategory, setSelectedCategory] =
    useState<StrategyCategory>("investing");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [videoId, setVideoId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const { isLessonComplete, completeLesson, addXp } = useUser();

  const filteredStrategies = strategies.filter(
    (s) => s.category === selectedCategory
  );

  // ── Fetch YouTube video ───────────────────────────────────────────────
  const fetchVideo = useCallback(async (searchTag: string) => {
    setLoadingVideo(true);
    setVideoId(null);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(searchTag)}`
      );
      if (res.ok) {
        const data = await res.json();
        setVideoId(data.videoId);
      }
    } catch (err) {
      console.error("YouTube search failed:", err);
    } finally {
      setLoadingVideo(false);
    }
  }, []);

  // ── Fetch AI Notes ────────────────────────────────────────────────────
  const fetchNotes = useCallback(
    async (strategy: Strategy) => {
      setLoadingNotes(true);
      setNotes("");
      try {
        const res = await fetch("/api/ai/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: strategy.aiPrompt,
            strategyId: strategy.id,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setNotes(data.content);

          // Mark as complete & award XP
          if (!isLessonComplete(strategy.id)) {
            completeLesson(strategy.id);
            addXp(strategy.xpReward);
          }
        }
      } catch (err) {
        console.error("Notes generation failed:", err);
        setNotes("*Failed to generate notes. Please try again.*");
      } finally {
        setLoadingNotes(false);
      }
    },
    [isLessonComplete, completeLesson, addXp]
  );

  // ── Open strategy ─────────────────────────────────────────────────────
  const openStrategy = useCallback(
    (strategy: Strategy) => {
      setSelectedStrategy(strategy);
      fetchVideo(strategy.ytSearchTag);
      fetchNotes(strategy);
    },
    [fetchVideo, fetchNotes]
  );

  // ── If a strategy is selected, show the lesson view ───────────────────
  if (selectedStrategy) {
    return (
      <div className="finlearn">
        {/* Lesson header */}
        <div className="finlearn-lesson-header">
          <button
            className="finlearn-back-btn"
            onClick={() => setSelectedStrategy(null)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h2 className="finlearn-lesson-title">{selectedStrategy.title}</h2>
          <span
            className={`finlearn-difficulty finlearn-difficulty--${selectedStrategy.difficulty.toLowerCase()}`}
          >
            {selectedStrategy.difficulty}
          </span>
        </div>

        {/* Split view */}
        <div className="finlearn-split">
          {/* Video pane */}
          <div className="finlearn-video-pane">
            {loadingVideo ? (
              <div className="finlearn-placeholder">
                <Loader2 size={32} className="spin" />
                <span>Loading video...</span>
              </div>
            ) : videoId ? (
              <iframe
                className="finlearn-iframe"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedStrategy.title}
              />
            ) : (
              <div className="finlearn-placeholder">
                <Play size={32} />
                <span>Video unavailable</span>
              </div>
            )}
          </div>

          {/* Notes pane */}
          <div className="finlearn-notes-pane">
            <div className="finlearn-notes-header">
              <Sparkles size={14} className="text-cyan-400" />
              <span>AI-Generated Notes</span>
            </div>
            <div className="finlearn-notes-body">
              {loadingNotes ? (
                <div className="finlearn-placeholder">
                  <Loader2 size={24} className="spin" />
                  <span>Generating notes with Nova AI...</span>
                </div>
              ) : notes ? (
                <div className="finlearn-notes-content">
                  {notes.split("\n").map((line, i) => {
                    if (line.startsWith("# "))
                      return (
                        <h3 key={i} className="finlearn-note-h3">
                          {line.replace(/^#+\s*/, "")}
                        </h3>
                      );
                    if (line.startsWith("## "))
                      return (
                        <h4 key={i} className="finlearn-note-h4">
                          {line.replace(/^#+\s*/, "")}
                        </h4>
                      );
                    if (line.startsWith("- "))
                      return (
                        <p key={i} className="finlearn-note-bullet">
                          • {line.replace(/^-\s*/, "")}
                        </p>
                      );
                    if (line.startsWith("**"))
                      return (
                        <p key={i} className="finlearn-note-bold">
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    if (line.trim() === "") return <br key={i} />;
                    return (
                      <p key={i} className="finlearn-note-text">
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="finlearn-placeholder">
                  <BookOpen size={24} />
                  <span>Notes will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main: Sidebar + Timeline ──────────────────────────────────────────
  return (
    <div className="finlearn">
      {/* Sidebar */}
      <aside className="finlearn-sidebar">
        <div className="finlearn-sidebar-header">
          <BookOpen size={18} className="text-cyan-400" />
          <span>Categories</span>
        </div>
        {(Object.keys(categoryInfo) as StrategyCategory[]).map((cat) => {
          const info = categoryInfo[cat];
          const count = strategies.filter((s) => s.category === cat).length;
          const completed = strategies.filter(
            (s) => s.category === cat && isLessonComplete(s.id)
          ).length;
          return (
            <button
              key={cat}
              className={`finlearn-cat-btn ${
                selectedCategory === cat ? "finlearn-cat-btn--active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                borderColor:
                  selectedCategory === cat ? info.color : "transparent",
              }}
            >
              <span className="finlearn-cat-icon">{info.icon}</span>
              <div className="finlearn-cat-info">
                <span className="finlearn-cat-name">{info.name}</span>
                <span className="finlearn-cat-count">
                  {completed}/{count} complete
                </span>
              </div>
              <ChevronRight size={14} className="finlearn-cat-arrow" />
            </button>
          );
        })}
      </aside>

      {/* Timeline */}
      <main className="finlearn-main">
        <div className="finlearn-main-header">
          <h2>{categoryInfo[selectedCategory].icon} {categoryInfo[selectedCategory].name}</h2>
          <span className="finlearn-main-subtitle">
            {filteredStrategies.length} strategies available
          </span>
        </div>

        <div className="finlearn-timeline">
          {filteredStrategies.map((strategy, idx) => {
            const completed = isLessonComplete(strategy.id);
            return (
              <button
                key={strategy.id}
                className={`finlearn-card ${
                  completed ? "finlearn-card--completed" : ""
                }`}
                onClick={() => openStrategy(strategy)}
              >
                {/* Timeline connector */}
                {idx < filteredStrategies.length - 1 && (
                  <div className="finlearn-connector" />
                )}

                {/* Node dot */}
                <div
                  className="finlearn-node"
                  style={{
                    borderColor: completed
                      ? "#34d399"
                      : categoryInfo[selectedCategory].color,
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : (
                    <Play size={10} />
                  )}
                </div>

                {/* Card content */}
                <div className="finlearn-card-body">
                  <div className="finlearn-card-top">
                    <h3>{strategy.title}</h3>
                    <span
                      className={`finlearn-difficulty finlearn-difficulty--${strategy.difficulty.toLowerCase()}`}
                    >
                      {strategy.difficulty}
                    </span>
                  </div>
                  <p className="finlearn-card-desc">{strategy.description}</p>
                  <div className="finlearn-card-footer">
                    <span className="finlearn-xp">
                      <Star size={12} />
                      {strategy.xpReward} XP
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
