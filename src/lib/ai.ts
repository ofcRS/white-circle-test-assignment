import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Cheap & fast default for development
export const defaultModel = openrouter.chat("openai/gpt-4o-mini");

// Smarter model for complex tasks
export const smartModel = openrouter.chat("anthropic/claude-sonnet-4-5");
