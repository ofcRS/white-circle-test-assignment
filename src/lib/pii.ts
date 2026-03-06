import { generateText } from "ai";
import { piiModel } from "@/lib/ai";

const PII_SYSTEM_PROMPT = `You are a PII detection system. Your job is to return the EXACT same text you receive, but wrap any PII (personally identifiable information) with XML tags in the format: <pii type="TYPE">value</pii>

PII types to detect:
- name (person names)
- email (email addresses)
- phone (phone numbers)
- address (physical addresses)
- ssn (social security numbers)
- credit_card (credit card numbers)
- date_of_birth (dates of birth)
- ip_address (IP addresses)
- passport (passport numbers)

Rules:
- Return ONLY the text with PII tags added. No explanations.
- Do NOT modify, rephrase, or add any text. Only add PII tags.
- If no PII is found, return the text exactly as-is.`;

function stripPiiTags(text: string): string {
  return text.replace(/<pii type="[^"]*">(.*?)<\/pii>/g, "$1");
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*|__|\*|_|#{1,6}\s?/g, "");
}

export async function detectPII(text: string): Promise<string> {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    console.log("[PII] Skipping short text:", JSON.stringify(text));
    return text;
  }

  // Capture leading/trailing whitespace to re-attach after PII detection
  const leadingWs = text.slice(0, text.indexOf(trimmed[0]));
  const trailingWs = text.slice(text.lastIndexOf(trimmed[trimmed.length - 1]) + 1);

  try {
    console.log("[PII] Detecting PII in:", JSON.stringify(trimmed.slice(0, 80)));
    const { text: result } = await generateText({
      model: piiModel,
      system: PII_SYSTEM_PROMPT,
      prompt: trimmed,
    });

    const resultTrimmed = result.trim();
    console.log("[PII] LLM returned:", JSON.stringify(resultTrimmed.slice(0, 120)));

    const stripped = stripPiiTags(resultTrimmed);
    if (stripMarkdown(stripped) !== stripMarkdown(trimmed)) {
      console.log("[PII] Validation FAILED — LLM modified text. Falling back to original.");
      console.log("[PII]   stripped:", JSON.stringify(stripMarkdown(stripped).slice(0, 80)));
      console.log("[PII]   original:", JSON.stringify(stripMarkdown(trimmed).slice(0, 80)));
      return text;
    }

    const hasTags = resultTrimmed !== stripped;
    console.log("[PII] Validation passed. Has PII tags:", hasTags);
    return leadingWs + resultTrimmed + trailingWs;
  } catch (err) {
    console.error("[PII] Error during detection:", err);
    return text;
  }
}
