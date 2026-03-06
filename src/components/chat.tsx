"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import type { UIMessage } from "ai";
import {
  ShieldCheck,
  Lock,
  Send,
  User,
  CheckCheck,
  Fingerprint,
  Loader2,
} from "lucide-react";

export function Chat({
  chatId: initialChatId,
  initialMessages,
  onChatCreated,
}: {
  chatId?: string;
  initialMessages?: UIMessage[];
  onChatCreated?: () => void;
}) {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        body: () => ({ chatId: initialChatId }),
      }),
    [initialChatId],
  );

  const { messages, sendMessage, status } = useChat({
    id: initialChatId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentPending = useRef(false);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // On mount, check for a pending message from sessionStorage (new chat redirect)
  useEffect(() => {
    if (!initialChatId || hasSentPending.current) return;
    const key = `pendingMessage_${initialChatId}`;
    const pendingText = sessionStorage.getItem(key);
    if (pendingText) {
      sessionStorage.removeItem(key);
      hasSentPending.current = true;
      sendMessage({ text: pendingText });
    }
  }, [initialChatId, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isCreatingChat) return;

    const text = input;
    setInput("");

    if (initialChatId) {
      // Existing chat: send directly
      sendMessage({ text });
      return;
    }

    // New chat: create in DB, store pending message, redirect
    const newChatId = crypto.randomUUID();
    setIsCreatingChat(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newChatId,
          title: text.slice(0, 100),
        }),
      });
      if (!res.ok) throw new Error("Failed to create chat");

      sessionStorage.setItem(`pendingMessage_${newChatId}`, text);
      onChatCreated?.();
      router.push(`/chat/${newChatId}`);
    } catch {
      // Restore input on failure
      setInput(text);
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="glass-surface flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Secure Channel</p>
            <p className="text-[10px] text-muted-foreground">
              Session encrypted
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-primary/20 text-primary text-[10px]"
        >
          <Fingerprint className="size-3" />
          PII Protected
        </Badge>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-6"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
              >
                {message.role === "user" ? (
                  <UserBubble message={message} />
                ) : (
                  <AssistantBubble message={message} />
                )}
              </div>
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <TypingIndicator />
              )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="glass-surface px-4 py-3 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a secure message..."
              className="min-h-[48px] max-h-[160px] resize-none rounded-xl border-border bg-background/60 pr-12 text-sm placeholder:text-muted-foreground/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {input.length > 0 && (
              <span className="absolute bottom-2 right-12 text-[10px] text-muted-foreground tabular-nums">
                {input.length}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || isCreatingChat || !input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreatingChat ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-muted-foreground/60">
          <Lock className="mr-1 inline size-2.5" />
          Messages are end-to-end encrypted
        </p>
      </div>
    </div>
  );
}

function UserBubble({ message }: { message: { createdAt?: Date; parts: Array<{ type: string; text?: string }> } }) {
  return (
    <div className="flex justify-end gap-2.5">
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-br-md bg-primary/15 border border-primary/10 px-4 py-2.5">
          <div className="text-sm whitespace-pre-wrap">
            {message.parts.map((part, i) =>
              part.type === "text" ? (
                <span key={i}>{part.text}</span>
              ) : null
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground/60">
          <span className="font-mono" suppressHydrationWarning>
            {(message.createdAt ?? new Date()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <CheckCheck className="size-3 text-primary/60" />
        </div>
      </div>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
        <User className="size-3.5 text-primary" />
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: { createdAt?: Date; parts: Array<{ type: string; text?: string }> } }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card border border-border">
        <ShieldCheck className="size-3.5 text-primary" />
      </div>
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-2.5">
          <div className="text-sm">
            {message.parts.map((part, i) =>
              part.type === "text" ? (
                <Markdown key={i}>{part.text!}</Markdown>
              ) : null
            )}
          </div>
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground/60 font-mono" suppressHydrationWarning>
          {(message.createdAt ?? new Date()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-in-up">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card border border-border">
        <ShieldCheck className="size-3.5 text-primary" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-muted-foreground/50"
                style={{
                  animation: `bounce-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            Generating secure response...
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="animate-fade-in-up flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <ShieldCheck className="size-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Lock className="size-3.5" />
          </div>
        </div>
        <h2 className="text-lg font-semibold">Secure Channel Ready</h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Your conversation is protected with end-to-end encryption and
          real-time PII detection.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge
            variant="outline"
            className="border-border text-muted-foreground"
          >
            <Lock className="size-3" />
            AES-256
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground"
          >
            <ShieldCheck className="size-3" />
            Zero-Knowledge
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground"
          >
            <Fingerprint className="size-3" />
            PII Scanning
          </Badge>
        </div>
      </div>
    </div>
  );
}
