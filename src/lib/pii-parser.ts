export type PIISegment =
  | { type: "text"; content: string }
  | { type: "pii"; content: string; piiType: string };

const PII_TAG_REGEX = /<pii type="([^"]*)">(.*?)<\/pii>/g;

export function parsePIIText(text: string): PIISegment[] {
  const segments: PIISegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PII_TAG_REGEX)) {
    const matchStart = match.index!;
    if (matchStart > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, matchStart) });
    }
    segments.push({ type: "pii", content: match[2], piiType: match[1] });
    lastIndex = matchStart + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}
