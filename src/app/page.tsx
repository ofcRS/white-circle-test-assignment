"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import { ChatHistory } from "@/components/chat-history";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Fingerprint } from "lucide-react";
import type { UIMessage } from "ai";

function SecurityStatusBar() {
  return (
    <header className="glass-surface sticky top-0 z-50 flex h-14 items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="size-5 text-primary" />
        <span className="text-sm font-semibold tracking-widest text-foreground">
          WHITE CIRCLE
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="hidden border-primary/20 text-primary sm:inline-flex"
        >
          <Lock className="size-3" />
          End-to-End Encrypted
        </Badge>
        <Badge
          variant="outline"
          className="hidden border-primary/20 text-primary sm:inline-flex"
        >
          <Fingerprint className="size-3" />
          PII Protection Active
        </Badge>
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="hidden sm:inline">Secure</span>
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  activeChatId,
  refreshKey,
}: {
  activeChatId?: string;
  refreshKey?: number;
}) {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">WHITE CIRCLE</p>
          <p className="text-[10px] text-muted-foreground">Secure AI Chat</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Chat History
        </p>
        <ChatHistory activeChatId={activeChatId} refreshKey={refreshKey} />
      </div>

      <div className="border-t border-border px-4 py-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          All messages are processed with real-time PII detection and encrypted
          end-to-end.
        </p>
      </div>
    </aside>
  );
}

export default function Home({
  chatId,
  initialMessages,
}: {
  chatId?: string;
  initialMessages?: UIMessage[];
} = {}) {
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SecurityStatusBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeChatId={chatId} refreshKey={sidebarRefreshKey} />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Chat
            chatId={chatId}
            initialMessages={initialMessages}
            onChatCreated={() =>
              setSidebarRefreshKey((k) => k + 1)
            }
          />
        </main>
      </div>
    </div>
  );
}
