import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
} from "ai";
import { defaultModel } from "@/lib/ai";
import { createPIIStream } from "@/lib/pii-stream";
import { saveMessage, updateChatTitle } from "@/lib/chat-db";

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId?: string } =
    await req.json();

  console.log("[API/chat] POST received. chatId:", chatId, "messages:", messages.length);

  // Save user message to DB if chatId provided
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (chatId && lastUserMsg) {
    console.log("[API/chat] Saving user message:", lastUserMsg.id);
    await saveMessage({
      id: lastUserMsg.id,
      chatId,
      role: "user",
      parts: lastUserMsg.parts,
    });

    // Update chat title from first user message
    if (messages.filter((m) => m.role === "user").length === 1) {
      const firstText = lastUserMsg.parts.find((p) => p.type === "text");
      if (firstText && "text" in firstText) {
        const title = firstText.text.slice(0, 100);
        await updateChatTitle(chatId, title);
      }
    }
  } else {
    console.log("[API/chat] No chatId or no user message. chatId:", chatId, "lastUserMsg:", !!lastUserMsg);
  }

  console.log("[API/chat] Starting streamText...");
  const result = streamText({
    model: defaultModel,
    system: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  console.log("[API/chat] Returning stream response");
  return createUIMessageStreamResponse({
    stream: createPIIStream(result, {
      onFinish: chatId
        ? async ({ responseMessage }) => {
            console.log("[API/chat] onFinish: saving assistant message:", responseMessage.id);
            await saveMessage({
              id: responseMessage.id,
              chatId,
              role: "assistant",
              parts: responseMessage.parts,
            });
            console.log("[API/chat] onFinish: assistant message saved");
          }
        : undefined,
    }),
  });
}
