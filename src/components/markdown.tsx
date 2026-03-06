"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { PiiSpoiler } from "./pii-spoiler";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("hljs language-", "") ?? "";

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-2 left-3 text-xs text-muted-foreground select-none">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <code className={className}>{children}</code>
    </div>
  );
}


function preprocessPII(text: string): string {
  return text.replace(
    /<pii\s+type="([^"]+)">([\s\S]*?)<\/pii>/g,
    '<span data-pii-type="$1">$2</span>'
  );
}

export const Markdown = memo(function Markdown({
  children,
}: {
  children: string;
}) {
  return (
    <div className="markdown">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={{
        pre({ children }) {
          return <pre>{children}</pre>;
        },
        code({ className, children, ...props }) {
          const isBlock = className?.includes("language-") || className?.includes("hljs");
          if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
          }
          return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
        a({ href, children, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
              {...props}
            >
              {children}
            </a>
          );
        },
        span({ node, children, ...props }) {
          const piiType = (props as Record<string, unknown>)["data-pii-type"] as string | undefined;
          if (piiType) {
            return <PiiSpoiler>{children}</PiiSpoiler>;
          }
          return <span {...props}>{children}</span>;
        },
      }}
    >
      {preprocessPII(children)}
    </ReactMarkdown>
    </div>
  );
});
