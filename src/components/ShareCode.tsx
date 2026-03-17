"use client";

import { useState } from "react";

interface ShareCodeProps {
  childId: string;
}

export default function ShareCode({ childId }: ShareCodeProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(childId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium">共有コード</p>
          <p className="text-xs font-mono text-gray-600 truncate">{childId}</p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 rounded-full bg-yellow-400 text-white text-xs font-bold"
        >
          {copied ? "コピー済み✓" : "コピー"}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">このコードをもう一人の親に送るとデータが共有できます</p>
    </div>
  );
}
