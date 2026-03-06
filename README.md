# White Circle

Secure AI chat application with real-time PII detection and masking, built with Next.js 16 and Vercel AI SDK 6.

## Features

- **AI Chat** — streaming responses via OpenRouter (GPT-4.1-mini)
- **PII Detection** — automatic detection of names, emails, phones, addresses, passport numbers, INN, SNILS
- **PII Masking** — sensitive data hidden behind spoiler tags with click-to-reveal
- **Chat Persistence** — conversations saved to Supabase with full history
- **Markdown Rendering** — rich message formatting with syntax highlighting
- **Dark Mode** — system-aware theme switching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | Vercel AI SDK 6 + OpenRouter |
| Database | Supabase (PostgreSQL) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Language | TypeScript 5 |
| Runtime | Bun |

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Run database migrations (requires Supabase CLI)
supabase db push

# Start development server
bun dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key from [OpenRouter](https://openrouter.ai) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # Streaming chat endpoint with PII scanning
│   │   └── chats/               # Chat CRUD endpoints
│   ├── chat/[chatId]/page.tsx   # Individual chat page
│   ├── page.tsx                 # Home / new chat
│   └── layout.tsx               # Root layout with theme provider
├── components/
│   ├── chat.tsx                 # Main chat component
│   ├── chat-history.tsx         # Sidebar with saved conversations
│   ├── markdown.tsx             # Markdown renderer
│   ├── pii-spoiler.tsx          # Click-to-reveal PII spoiler
│   ├── pii-text.tsx             # Text with inline PII masking
│   └── ui/                      # shadcn/ui primitives
└── lib/
    ├── ai.ts                    # OpenRouter provider config
    ├── chat-db.ts               # Chat persistence layer
    ├── db-types.ts              # Database type definitions
    ├── pii.ts                   # PII detection via LLM
    ├── pii-parser.ts            # PII entity parser
    ├── pii-stream.ts            # Streaming PII processing
    └── supabase.ts              # Supabase client
```

## Deployment

Deploy to Vercel with one click or via CLI:

```bash
bunx vercel --prod
```

Set the environment variables in your Vercel project settings before deploying.
