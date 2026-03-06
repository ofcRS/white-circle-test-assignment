"use client";

import { useState } from "react";

export function PiiSpoiler({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);

  return (
    <span
      className={`pii-spoiler ${hidden ? "" : "pii-spoiler--revealed"}`}
      onClick={() => setHidden((h) => !h)}
    >
      {children}
    </span>
  );
}
