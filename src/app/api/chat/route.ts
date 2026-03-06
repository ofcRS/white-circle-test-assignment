import { streamText } from "ai";
import { defaultModel } from "@/lib/ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: defaultModel,
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toUIMessageStreamResponse();
}
