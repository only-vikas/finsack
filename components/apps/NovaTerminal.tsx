"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Terminal,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ChatMessage } from "@/types/os";

// ─── Nova Terminal Component ────────────────────────────────────────────────

export default function NovaTerminal({ windowId }: { windowId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to **Nova Terminal** 🚀\n\nI'm your FinTech AI assistant. Ask me anything about trading strategies, market analysis, financial concepts, or portfolio management.\n\nTry: *\"Explain RSI divergence\"* or *\"What's a covered call?\"*",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.content || "I couldn't generate a response.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Error: Could not reach Nova AI. Please try again.",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Network error. Please check your connection.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  // ── Clear chat ────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: Date.now(),
      },
    ]);
  };

  // ── Simple markdown-ish renderer ──────────────────────────────────────
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="nova-bold">$1</strong>'
      );
      // Italic
      processed = processed.replace(
        /\*(.+?)\*/g,
        '<em class="nova-italic">$1</em>'
      );
      // Inline code
      processed = processed.replace(
        /`(.+?)`/g,
        '<code class="nova-code">$1</code>'
      );

      if (line.startsWith("# "))
        return (
          <h3 key={i} className="nova-msg-h3">
            {line.replace(/^#+\s*/, "")}
          </h3>
        );
      if (line.startsWith("## "))
        return (
          <h4 key={i} className="nova-msg-h4">
            {line.replace(/^#+\s*/, "")}
          </h4>
        );
      if (line.startsWith("- ") || line.startsWith("• "))
        return (
          <p
            key={i}
            className="nova-msg-bullet"
            dangerouslySetInnerHTML={{
              __html: "• " + processed.replace(/^[-•]\s*/, ""),
            }}
          />
        );
      if (line.trim() === "") return <br key={i} />;
      return (
        <p
          key={i}
          className="nova-msg-text"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    });
  };

  return (
    <div className="nova">
      {/* Header */}
      <div className="nova-header">
        <div className="nova-header-left">
          <Terminal size={16} className="text-emerald-400" />
          <span>Nova Terminal</span>
          <span className="nova-model-badge">Nemotron 120B</span>
        </div>
        <button className="nova-clear-btn" onClick={clearChat} title="Clear chat">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="nova-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`nova-msg ${
              msg.role === "user" ? "nova-msg--user" : "nova-msg--assistant"
            }`}
          >
            <div className="nova-msg-avatar">
              {msg.role === "user" ? (
                <User size={14} />
              ) : (
                <Bot size={14} className="text-emerald-400" />
              )}
            </div>
            <div className="nova-msg-body">{renderContent(msg.content)}</div>
          </div>
        ))}

        {isLoading && (
          <div className="nova-msg nova-msg--assistant">
            <div className="nova-msg-avatar">
              <Bot size={14} className="text-emerald-400" />
            </div>
            <div className="nova-msg-body nova-typing">
              <Sparkles size={14} className="spin" />
              <span>Nova is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="nova-input-bar">
        <input
          ref={inputRef}
          className="nova-input"
          placeholder="Ask Nova anything about finance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading}
        />
        <button
          className="nova-send-btn"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
