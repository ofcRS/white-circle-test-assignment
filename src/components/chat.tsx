"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={
              message.role === "user" ? "ml-auto max-w-[80%]" : "max-w-[80%]"
            }
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {message.role === "user" ? "You" : "AI"}
              </p>
              <div className="text-sm whitespace-pre-wrap">
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i}>{part.text}</span>
                  ) : null
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
