import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
} from "ai";
import { defaultModel } from "@/lib/ai";
import { createPIIStream } from "@/lib/pii-stream";
import { saveMessage, ensureChatExists } from "@/lib/chat-db";

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
    await req.json();

  // Ensure chat exists and save user message to DB
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (chatId && lastUserMsg) {
    const firstText = lastUserMsg.parts.find((p) => p.type === "text");
    const title = firstText && "text" in firstText ? firstText.text.slice(0, 100) : "New Chat";
    await ensureChatExists(chatId, title);
    await saveMessage({
      id: lastUserMsg.id,
      chatId,
      role: "user",
      parts: lastUserMsg.parts,
    });
  }

  const result = streamText({
    model: defaultModel,
    system: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: createPIIStream(result, {
      onFinish: chatId
        ? async ({ responseMessage }) => {
            await saveMessage({
              id: responseMessage.id,
              chatId,
              role: "assistant",
              parts: responseMessage.parts,
            });
          }
        : undefined,
    }),
  });
}
