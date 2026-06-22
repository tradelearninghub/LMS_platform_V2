"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="text-xs border rounded px-2.5 py-1 bg-secondary hover:bg-secondary/80 min-w-[60px] font-medium transition-colors"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
