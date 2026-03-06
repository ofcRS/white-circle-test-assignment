"use client";

import { parsePIIText } from "@/lib/pii-parser";
import { PiiSpoiler } from "./pii-spoiler";

export function PIIText({ text }: { text: string }) {
  const segments = parsePIIText(text);

  if (segments.length === 1 && segments[0].type === "text") {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === "text" ? (
          <span key={i}>{segment.content}</span>
        ) : (
          <PiiSpoiler key={i}>{segment.content}</PiiSpoiler>
        )
      )}
    </>
  );
}
