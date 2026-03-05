# Next.js Interview Template

Next.js 16 + TypeScript + Tailwind CSS v4 + Vercel AI SDK 6 + shadcn/ui + Zod

## Setup

```bash
bun install
cp .env.example .env.local  # add your API keys
bun dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/ai.ts` | AI provider config (OpenAI + Anthropic) |
| `src/app/api/chat/route.ts` | Streaming chat API route |
| `src/components/chat.tsx` | Chat UI component |
| `src/components/ui/` | shadcn/ui components (button, input, card, textarea) |
| `src/lib/utils.ts` | `cn()` utility for classnames |

## AI SDK Quick Reference

```ts
// --- Server-side (route handlers, server actions) ---
import { streamText, generateText, generateObject } from "ai";
import { model, openai, anthropic } from "@/lib/ai";

// Stream text
const result = streamText({ model, messages });
return result.toUIMessageStreamResponse();

// Generate text (non-streaming)
const { text } = await generateText({ model, prompt: "..." });

// Structured output with Zod
import { z } from "zod/v4";
const { object } = await generateObject({
  model,
  schema: z.object({ name: z.string(), age: z.number() }),
  prompt: "...",
});

// Switch model
streamText({ model: openai("gpt-4o"), messages });
streamText({ model: anthropic("claude-sonnet-4-20250514"), messages });

// --- Client-side ---
import { useChat } from "@ai-sdk/react";
const { messages, sendMessage, status } = useChat();
// status: "ready" | "submitted" | "streaming" | "error"
sendMessage({ text: "Hello" });
```

## Add More UI Components

```bash
bunx shadcn@latest add dialog select tabs badge
```
