import { Role } from "@/backend";
import {
  useAskAI,
  useChatHistory,
  useClearChatHistory,
} from "@/hooks/useBackend";
import { gsap } from "gsap";
import { Bot, Camera, Send, Sparkles, Trash2, User, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STARTER_PROMPTS = [
  "Suggest 5 cinematic poses for golden hour",
  "What equipment do I need for night photography?",
  "Create a shot list for a fashion editorial",
];

// ── Typing Indicator ──────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div
      className="flex gap-3 items-end"
      data-ocid="chat.loading_state"
      aria-live="polite"
      aria-label="AI is typing"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      {/* Bubble */}
      <div
        className="px-5 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 270 / 0.8), oklch(0.18 0.06 305 / 0.6))",
          backdropFilter: "blur(20px)",
          border: "1px solid oklch(0.5 0.25 262 / 0.4)",
          boxShadow: "0 0 16px oklch(0.5 0.25 262 / 0.25)",
        }}
      >
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({
  onSelect,
}: {
  onSelect: (p: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.92, y: 24 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power3.out" },
    );
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center h-full py-16 text-center px-6"
      data-ocid="chat.empty_state"
    >
      {/* Icon cluster */}
      <div className="relative mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 270 / 0.7), oklch(0.18 0.06 305 / 0.5))",
            border: "1px solid oklch(0.5 0.25 262 / 0.5)",
            boxShadow:
              "0 0 32px oklch(0.5 0.25 262 / 0.4), inset 0 0 20px oklch(0.5 0.25 262 / 0.1)",
          }}
        >
          <Camera className="w-9 h-9 text-primary" />
        </div>
        <div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "oklch(0.55 0.26 305 / 0.8)",
            border: "1px solid oklch(0.65 0.28 305 / 0.6)",
            boxShadow: "0 0 12px oklch(0.55 0.26 305 / 0.6)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-secondary-foreground" />
        </div>
      </div>

      <h2
        className="font-display font-bold text-2xl mb-2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.85 0.2 262), oklch(0.75 0.25 305))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        AI Photography Assistant
      </h2>
      <p className="font-body text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
        Your intelligent co-pilot for poses, lighting, locations, and everything
        photography.
      </p>

      {/* Starter chips */}
      <div className="w-full max-w-sm space-y-2.5">
        {STARTER_PROMPTS.map((prompt, i) => (
          <button
            key={prompt}
            type="button"
            data-ocid={`chat.starter.item.${i + 1}`}
            onClick={() => onSelect(prompt)}
            className="
              w-full px-4 py-3 rounded-xl text-left
              font-body text-xs text-muted-foreground
              transition-smooth hover:text-foreground
            "
            style={{
              background: "oklch(0.2 0.04 270 / 0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid oklch(0.5 0.25 262 / 0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid oklch(0.5 0.25 262 / 0.6)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 12px oklch(0.5 0.25 262 / 0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.border =
                "1px solid oklch(0.5 0.25 262 / 0.25)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <span className="text-primary mr-2">›</span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  role,
  content,
  timestamp,
  index,
}: {
  role: Role;
  content: string;
  timestamp: bigint;
  index: number;
}) {
  const isUser = role === Role.user;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        x: isUser ? 40 : -40,
        y: 8,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
        delay: index < 5 ? 0 : 0,
      },
    );
  }, [isUser, index]);

  return (
    <div
      ref={ref}
      data-ocid={`chat.message.item.${index + 1}`}
      className={`flex gap-2.5 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1"
        style={
          isUser
            ? {
                background: "oklch(0.35 0.18 195 / 0.5)",
                border: "1px solid oklch(0.75 0.2 195 / 0.5)",
              }
            : {
                background: "oklch(0.22 0.08 270 / 0.8)",
                border: "1px solid oklch(0.5 0.25 262 / 0.4)",
              }
        }
      >
        {isUser ? (
          <User
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.88 0.18 195)" }}
          />
        ) : (
          <Bot className="w-3.5 h-3.5 text-primary" />
        )}
      </div>

      {/* Bubble + timestamp */}
      <div
        className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className="px-4 py-3 rounded-2xl font-body text-sm leading-relaxed text-foreground"
          style={
            isUser
              ? {
                  /* Neon cyan user bubble */
                  background:
                    "linear-gradient(135deg, oklch(0.28 0.12 195 / 0.85), oklch(0.22 0.1 205 / 0.75))",
                  backdropFilter: "blur(16px)",
                  border: "1px solid oklch(0.75 0.2 195 / 0.5)",
                  boxShadow:
                    "0 0 20px oklch(0.75 0.2 195 / 0.25), inset 0 0 10px oklch(0.75 0.2 195 / 0.08)",
                  borderRadius: "1rem 1rem 0.25rem 1rem",
                }
              : {
                  /* Purple glassmorphism AI bubble */
                  background:
                    "linear-gradient(135deg, oklch(0.22 0.08 270 / 0.8), oklch(0.18 0.06 305 / 0.6))",
                  backdropFilter: "blur(20px)",
                  border: "1px solid oklch(0.5 0.25 262 / 0.4)",
                  boxShadow: "0 0 16px oklch(0.5 0.25 262 / 0.2)",
                  borderRadius: "1rem 1rem 1rem 0.25rem",
                }
          }
        >
          {content}
        </div>
        {/* Timestamp */}
        {timestamp > 0n && (
          <span className="font-mono text-[10px] text-muted-foreground/60 px-1">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { data: history = [], isLoading } = useChatHistory();
  const askAI = useAskAI();
  const clearHistory = useClearChatHistory();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Entrance animations on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
    if (inputBarRef.current) {
      gsap.fromTo(
        inputBarRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 },
      );
    }
  }, []);

  // Auto-scroll to bottom when messages change or AI is typing
  const scrollKey = `${history?.length ?? 0}-${askAI.isPending}`;
  const prevScrollKeyRef = useRef("");
  useEffect(() => {
    if (scrollKey !== prevScrollKeyRef.current) {
      prevScrollKeyRef.current = scrollKey;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || askAI.isPending) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    const msgHistory: Array<[string, string]> = history.map((m) => [
      m.role,
      m.content,
    ]);
    await askAI.mutateAsync({ prompt, history: msgHistory });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterSelect = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ maxHeight: "calc(100vh - 0px)" }}
      data-ocid="chat.page"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        ref={headerRef}
        className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{
          background: "oklch(0.16 0.04 270 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.5 0.25 262 / 0.25)",
          boxShadow: "0 4px 24px oklch(0.5 0.25 262 / 0.1)",
        }}
        data-ocid="chat.header"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Bot icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.28 0.12 262 / 0.8), oklch(0.22 0.1 305 / 0.6))",
              border: "1px solid oklch(0.5 0.25 262 / 0.5)",
              boxShadow: "0 0 20px oklch(0.5 0.25 262 / 0.4)",
            }}
          >
            <Bot className="w-5 h-5 text-primary" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="font-display font-bold text-sm tracking-widest uppercase"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.88 0.18 195), oklch(0.75 0.25 262), oklch(0.7 0.28 305))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "none",
                }}
              >
                AI Photography Assistant
              </h1>
              {/* Online badge */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold"
                style={{
                  background: "oklch(0.35 0.18 142 / 0.25)",
                  border: "1px solid oklch(0.55 0.22 142 / 0.5)",
                  color: "oklch(0.72 0.2 142)",
                }}
                data-ocid="chat.online_badge"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "oklch(0.72 0.2 142)" }}
                />
                ONLINE
              </span>
            </div>
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-primary/60" />
              Powered by OpenAI
            </p>
          </div>
        </div>

        {/* Clear history */}
        <button
          type="button"
          data-ocid="chat.clear.button"
          onClick={() => clearHistory.mutate()}
          disabled={clearHistory.isPending || history.length === 0}
          aria-label="Clear chat history"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs font-medium shrink-0
            text-muted-foreground hover:text-destructive transition-smooth disabled:opacity-30"
          style={{
            background: "oklch(0.2 0.03 270 / 0.5)",
            border: "1px solid oklch(0.55 0.25 15 / 0)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.border =
              "1px solid oklch(0.55 0.25 15 / 0.3)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.25 15 / 0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.border =
              "1px solid oklch(0.55 0.25 15 / 0)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.2 0.03 270 / 0.5)";
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
        data-ocid="chat.messages.list"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "oklch(0.4 0.12 270 / 0.4) transparent",
        }}
      >
        {isLoading ? (
          <div className="space-y-5 pt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-xl bg-muted/30 animate-pulse shrink-0" />
                <div
                  className="h-14 rounded-2xl animate-pulse"
                  style={{
                    width: `${180 + i * 40}px`,
                    background: "oklch(0.22 0.04 270 / 0.5)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState onSelect={handleStarterSelect} />
        ) : (
          <>
            {history.map((msg, i) => (
              <MessageBubble
                key={msg.id.toString()}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                index={i}
              />
            ))}
            {askAI.isPending && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ──────────────────────────────────────────────────── */}
      <div
        ref={inputBarRef}
        className="shrink-0 px-5 py-4"
        style={{
          background: "oklch(0.15 0.04 270 / 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid oklch(0.5 0.25 262 / 0.2)",
        }}
        data-ocid="chat.input_bar"
      >
        {/* Error */}
        {askAI.isError && (
          <p
            className="font-body text-xs mb-2.5 px-1"
            style={{ color: "oklch(0.65 0.22 15)" }}
            data-ocid="chat.error_state"
          >
            ⚠ Error sending message. Please try again.
          </p>
        )}

        {/* Row */}
        <div className="flex gap-3 items-end">
          <div
            className="flex-1 rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.2 0.04 270 / 0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid oklch(0.5 0.25 262 / 0.3)",
              boxShadow: "inset 0 0 12px oklch(0.5 0.25 262 / 0.05)",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                "oklch(0.5 0.25 262 / 0.7)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 0 20px oklch(0.5 0.25 262 / 0.25), inset 0 0 12px oklch(0.5 0.25 262 / 0.05)";
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                "oklch(0.5 0.25 262 / 0.3)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "inset 0 0 12px oklch(0.5 0.25 262 / 0.05)";
            }}
          >
            <textarea
              ref={textareaRef}
              data-ocid="chat.message.input"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about photography, poses, lighting…"
              rows={1}
              className="
                w-full px-4 py-3 bg-transparent resize-none
                font-body text-sm text-foreground placeholder:text-muted-foreground/60
                focus:outline-none
              "
              style={{ minHeight: "48px", maxHeight: "128px" }}
              aria-label="Chat message input"
            />
          </div>

          {/* Send button */}
          <button
            type="button"
            data-ocid="chat.send.button"
            onClick={handleSend}
            disabled={!input.trim() || askAI.isPending}
            aria-label="Send message"
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-smooth
              disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.4 0.2 195 / 0.8), oklch(0.35 0.18 220 / 0.6))",
              border: "1px solid oklch(0.75 0.2 195 / 0.5)",
              boxShadow: "0 0 20px oklch(0.75 0.2 195 / 0.3)",
              color: "oklch(0.92 0.12 195)",
            }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 32px oklch(0.75 0.2 195 / 0.6)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(135deg, oklch(0.45 0.22 195 / 0.9), oklch(0.4 0.2 220 / 0.7))";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px oklch(0.75 0.2 195 / 0.3)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "linear-gradient(135deg, oklch(0.4 0.2 195 / 0.8), oklch(0.35 0.18 220 / 0.6))";
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Hint */}
        <p className="font-mono text-[10px] text-muted-foreground/50 mt-2 px-1">
          Enter to send&nbsp;·&nbsp;Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
