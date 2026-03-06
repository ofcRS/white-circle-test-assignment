import { createUIMessageStream, type streamText } from "ai";
import { detectPII } from "@/lib/pii";

// Extracts complete sentences from buffer, returns [sentences[], remainder]
function extractSentences(buffer: string): [string[], string] {
  const sentences: string[] = [];
  let remaining = buffer;

  while (true) {
    const match = remaining.match(/[.!?]\s|\n/);
    if (!match || match.index === undefined) break;

    const end = match.index + match[0].length;
    sentences.push(remaining.slice(0, end));
    remaining = remaining.slice(end);
  }

  return [sentences, remaining];
}

export function createPIIStream(
  result: ReturnType<typeof streamText>,
  options?: { onFinish?: Parameters<typeof createUIMessageStream>[0]["onFinish"] },
) {
  return createUIMessageStream({
    onFinish: options?.onFinish,
    execute: async ({ writer }) => {
      let buffer = "";
      let seqNum = 0;
      const results = new Map<number, string>();
      let nextToEmit = 0;
      let activeTextId: string | null = null;
      const pending: Promise<void>[] = [];

      function tryDrain() {
        while (results.has(nextToEmit)) {
          const text = results.get(nextToEmit)!;
          results.delete(nextToEmit);
          if (activeTextId) {
            writer.write({
              type: "text-delta",
              delta: text,
              id: activeTextId,
            });
          }
          nextToEmit++;
        }
      }

      function submitSentence(sentence: string) {
        const num = seqNum++;
        const promise = detectPII(sentence).then((tagged) => {
          results.set(num, tagged);
          tryDrain();
        });
        pending.push(promise);
      }

      const stream = result.toUIMessageStream();

      console.log("[PII-Stream] Starting stream processing");

      for await (const chunk of stream) {
        switch (chunk.type) {
          case "text-start":
            activeTextId = chunk.id;
            console.log("[PII-Stream] text-start, id:", chunk.id);
            writer.write(chunk);
            break;

          case "text-delta":
            buffer += chunk.delta;
            {
              const [sentences, remainder] = extractSentences(buffer);
              buffer = remainder;
              if (sentences.length > 0) {
                console.log("[PII-Stream] Extracted", sentences.length, "sentence(s), buffer remainder:", JSON.stringify(remainder.slice(0, 40)));
              }
              for (const sentence of sentences) {
                console.log("[PII-Stream] Submitting sentence #" + seqNum + ":", JSON.stringify(sentence.slice(0, 60)));
                submitSentence(sentence);
              }
            }
            break;

          case "text-end":
            console.log("[PII-Stream] text-end. Remaining buffer:", JSON.stringify(buffer.slice(0, 60)));
            if (buffer.length > 0) {
              console.log("[PII-Stream] Flushing remaining buffer as sentence #" + seqNum);
              submitSentence(buffer);
              buffer = "";
            }
            console.log("[PII-Stream] Waiting for", pending.length, "pending PII calls...");
            await Promise.all(pending);
            tryDrain();
            console.log("[PII-Stream] All PII calls resolved. Emitting text-end.");
            writer.write(chunk);
            activeTextId = null;
            break;

          default:
            console.log("[PII-Stream] Passthrough chunk type:", chunk.type);
            writer.write(chunk);
            break;
        }
      }

      console.log("[PII-Stream] Stream processing complete");
    },
  });
}
