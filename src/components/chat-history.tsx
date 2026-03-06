"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { ChatRow } from "@/lib/db-types";

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ChatHistory({
  activeChatId,
  refreshKey,
}: {
  activeChatId?: string;
  refreshKey?: number;
}) {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const router = useRouter();

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) setChats(await res.json());
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats, refreshKey]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    if (res.ok) {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (chatId === activeChatId) {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
      >
        <Plus className="size-3.5" />
        New Chat
      </Link>

      <div className="space-y-1">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
              chat.id === activeChatId
                ? "bg-primary/10 border border-primary/20 text-foreground"
                : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="truncate">{chat.title}</p>
              <p className="text-[10px] text-muted-foreground/60">
                {timeAgo(chat.updated_at)}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, chat.id)}
              className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="size-3" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
