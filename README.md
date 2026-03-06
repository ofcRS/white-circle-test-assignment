# Next.js Interview Template

Next.js 16 + TypeScript + Tailwind CSS v4 + Vercel AI SDK 6 + shadcn/ui + Zod

## Setup

```bash
bun install
cp .env.example .env.local  # add your OpenRouter API key
bun dev
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/ai.ts` | OpenRouter provider config + model shortcuts |
| `src/app/api/chat/route.ts` | Streaming chat API route |
| `src/components/chat.tsx` | Chat UI component |
| `src/components/ui/` | shadcn/ui components (button, input, card, textarea, badge, tabs, sonner) |
| `src/lib/utils.ts` | `cn()` utility for classnames |

## AI SDK 6 Quick Reference

### Streaming text (server-side)
```ts
import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";

const result = streamText({ model: defaultModel, system: "...", messages });
return result.toUIMessageStreamResponse();
```

### Structured output with Zod (server-side)
```ts
import { generateText, Output } from "ai";
import { z } from "zod";

const { output } = await generateText({
  model: defaultModel,
  output: Output.object({
    schema: z.object({
      entities: z.array(z.object({
        type: z.enum(["name", "email", "phone", "address", "passport", "inn", "snils"]),
        value: z.string(),
        start: z.number(),
        end: z.number(),
        confidence: z.number(),
      })),
    }),
  }),
  prompt: `Extract all PII entities from this text: ${text}`,
});
```

### Chat hook (client-side)
```ts
import { useState } from "react";
import { useChat } from "@ai-sdk/react";

const { messages, sendMessage, status } = useChat();
const [input, setInput] = useState("");

// status: "ready" | "submitted" | "streaming" | "error"
const isLoading = status === "submitted" || status === "streaming";

// Send a message
sendMessage({ text: input });

// Messages use parts-based structure (no .content string)
messages.map(m => m.parts.map(p => p.type === "text" ? p.text : null));
```

### Deprecated patterns to avoid
- `generateObject` -> use `generateText` with `output: Output.object({ schema })`
- `streamObject` -> use `streamText` with `output: Output.object({ schema })`
- `experimental_output` -> use `output`
- `toDataStreamResponse()` -> use `toUIMessageStreamResponse()`
- `import { useChat } from "ai/react"` -> use `import { useChat } from "@ai-sdk/react"`
- `useChat` no longer returns `input`/`handleInputChange`/`handleSubmit`/`isLoading` -> use `sendMessage`/`status` + own `useState`
- `CoreMessage` -> use `ModelMessage`
- `convertToCoreMessages()` -> use `convertToModelMessages()` (now async, must await)
- `addToolResult` -> use `addToolOutput`
- `message.content` -> use `message.parts` (parts-based structure)

## Add More UI Components

```bash
bunx shadcn@latest add [component-name]
```
