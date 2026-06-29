"use client";

/**
 * ChatBot.tsx — Floating AI Assistant powered by NVIDIA NIM
 *
 * ── LLM Chat Session Transcript (build-time Q&A with the model) ──────────────
 *
 * [DEV] → "What's the best UX pattern for a floating chatbot on a dashboard
 *           that already has a lot of data? Should it be a sidebar or a bubble?"
 *
 * [NVIDIA llama-3.3-70b] → "Go with a bottom-right bubble + expandable panel.
 *   It doesn't compete with primary content, users are trained to expect
 *   support chat in that corner, and it collapses out of the way. Add a
 *   subtle pulse on first load so it catches attention without being annoying."
 *
 * [DEV] → "What welcome message works best for an investment research assistant?"
 *
 * [NVIDIA llama-3.3-70b] → "Lead with what it can do immediately:
 *   'Hey! I'm InvestBot 👋 — ask me how this app works, what each agent does,
 *   or what any investing term means. Type a company name above to start
 *   your analysis!' That's action-oriented and sets expectations clearly."
 *
 * [DEV] → "How do I handle SSE streaming in a React component cleanly?"
 *
 * [NVIDIA llama-3.3-70b] → "Use fetch() with a ReadableStream reader in a
 *   useCallback. Accumulate the assistant's message in local state via
 *   setState(prev => prev + delta). Use a ref for auto-scrolling the message
 *   list. Cancel the stream on component unmount with an AbortController."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, User, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey! I'm **InvestBot** 👋 — your guide to this AI Research Agent.\n\nAsk me:\n• How does each agent work?\n• What does a score of 75 mean?\n• What's the difference between Bull & Bear cases?\n\nOr just type a **company name** in the search bar above to kick off a full analysis! 🚀",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
      setShowPulse(false);
    }
  }, [isOpen, isMinimized]);

  // Stop pulse after 6s
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Placeholder for streaming assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("API error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { content } = JSON.parse(payload);
            if (content) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: updated[updated.length - 1].content + content,
                };
                return updated;
              });
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "⚠️ Something went wrong. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen((o) => !o);
    setIsMinimized(false);
  };

  // Render simple markdown: **bold**, \n → <br>
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return (
        <span key={i}>
          {part.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating trigger bubble ── */}
      <button
        id="chatbot-trigger"
        onClick={toggleOpen}
        aria-label="Open AI Assistant"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.35)",
          background: "linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 100%)",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(16,185,129,0.3), 0 8px 30px rgba(16,185,129,0.4)"
            : "0 0 20px rgba(16,185,129,0.3), 0 4px 15px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: isOpen ? "scale(0.92)" : "scale(1)",
          animation: showPulse ? "chatbot-pulse 2s ease-in-out 3" : "none",
        }}
      >
        {isOpen ? (
          <X size={22} color="#ecfdf5" />
        ) : (
          <MessageSquare size={22} color="#ecfdf5" />
        )}

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#10b981",
              border: "2px solid #020a05",
              animation: "chatbot-dot-pulse 1.5s infinite",
            }}
          />
        )}
      </button>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          id="chatbot-panel"
          style={{
            position: "fixed",
            bottom: 96,
            right: 28,
            width: 360,
            height: isMinimized ? 56 : 520,
            borderRadius: 20,
            background: "rgba(5, 15, 8, 0.96)",
            border: "1px solid rgba(16,185,129,0.2)",
            boxShadow:
              "0 0 60px rgba(16,185,129,0.12), 0 24px 60px rgba(0,0,0,0.7)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            animation: "chatbot-slide-in 0.3s cubic-bezier(0.4,0,0.2,1) both",
            transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderBottom: "1px solid rgba(16,185,129,0.12)",
              background: "linear-gradient(90deg, rgba(16,185,129,0.08), transparent)",
              flexShrink: 0,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #047857, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 12px rgba(16,185,129,0.4)",
              }}
            >
              <Bot size={16} color="#ecfdf5" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ecfdf5",
                }}
              >
                InvestBot
              </div>
              <div style={{ fontSize: 11, color: "#2d4a38" }}>
                AI Research Assistant
              </div>
            </div>

            {/* Minimize */}
            <button
              id="chatbot-minimize"
              onClick={() => setIsMinimized((m) => !m)}
              aria-label="Minimize chat"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid rgba(16,185,129,0.15)",
                background: "transparent",
                color: "#6bac8a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <Minimize2 size={13} />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                id="chatbot-messages"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      animation: "chatbot-msg-in 0.25s ease both",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background:
                          msg.role === "assistant"
                            ? "linear-gradient(135deg, #047857, #10b981)"
                            : "rgba(16,185,129,0.12)",
                        border:
                          msg.role === "user"
                            ? "1px solid rgba(16,185,129,0.25)"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <Bot size={13} color="#ecfdf5" />
                      ) : (
                        <User size={13} color="#10b981" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "10px 13px",
                        borderRadius:
                          msg.role === "user"
                            ? "14px 4px 14px 14px"
                            : "4px 14px 14px 14px",
                        background:
                          msg.role === "user"
                            ? "linear-gradient(135deg, rgba(4,120,87,0.4), rgba(16,185,129,0.25))"
                            : "rgba(255,255,255,0.04)",
                        border:
                          msg.role === "user"
                            ? "1px solid rgba(16,185,129,0.3)"
                            : "1px solid rgba(255,255,255,0.06)",
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "#ecfdf5",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content === "" && isStreaming && idx === messages.length - 1 ? (
                        /* Typing indicator */
                        <span style={{ display: "flex", gap: 4, padding: "2px 0" }}>
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#10b981",
                                animation: `chatbot-typing 1.2s ease-in-out ${i * 0.2}s infinite`,
                                display: "inline-block",
                              }}
                            />
                          ))}
                        </span>
                      ) : (
                        renderContent(msg.content)
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: "12px 14px",
                  borderTop: "1px solid rgba(16,185,129,0.1)",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  background: "rgba(5,15,8,0.8)",
                  flexShrink: 0,
                }}
              >
                <textarea
                  ref={inputRef}
                  id="chatbot-input"
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the app or investing…"
                  disabled={isStreaming}
                  style={{
                    flex: 1,
                    resize: "none",
                    border: "1px solid rgba(16,185,129,0.18)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    color: "#ecfdf5",
                    fontSize: 13,
                    fontFamily: "Inter, system-ui, sans-serif",
                    padding: "9px 12px",
                    outline: "none",
                    lineHeight: 1.5,
                    transition: "border-color 0.15s",
                    overflowY: "hidden",
                    minHeight: 38,
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(16,185,129,0.45)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(16,185,129,0.18)")
                  }
                />
                <button
                  id="chatbot-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: "none",
                    background:
                      input.trim() && !isStreaming
                        ? "linear-gradient(135deg, #047857, #10b981)"
                        : "rgba(16,185,129,0.08)",
                    color: input.trim() && !isStreaming ? "#ecfdf5" : "#2d4a38",
                    cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    boxShadow:
                      input.trim() && !isStreaming
                        ? "0 0 12px rgba(16,185,129,0.3)"
                        : "none",
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes chatbot-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3), 0 4px 15px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 35px rgba(16,185,129,0.7), 0 4px 25px rgba(0,0,0,0.4); }
        }
        @keyframes chatbot-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes chatbot-slide-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatbot-typing {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        #chatbot-messages::-webkit-scrollbar { width: 4px; }
        #chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        #chatbot-messages::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 2px; }
      `}</style>
    </>
  );
}
