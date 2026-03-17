"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ChildSetup() {
  const [mode, setMode] = useState<"select" | "join">("select");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const createChild = useMutation(api.children.createChild);
  const linkToChild = useMutation(api.children.linkToChild);

  async function handleCreate() {
    setIsPending(true);
    await createChild({});
    setIsPending(false);
  }

  async function handleLink() {
    if (!code.trim()) return;
    setIsPending(true);
    setError(null);
    const result = await linkToChild({ childId: code.trim() });
    if (!result.success) {
      setError(result.message);
    }
    setIsPending(false);
  }

  if (mode === "join") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex flex-col items-center justify-center px-6 gap-6">
        <div className="bg-white/80 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="text-4xl">🔗</div>
          <p className="font-bold text-gray-700 text-center">共有コードをいれてね</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="コードをペースト"
            className="w-full border-2 border-yellow-300 rounded-xl px-4 py-3 text-sm font-mono text-gray-700 focus:outline-none focus:border-yellow-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleLink}
            disabled={isPending || !code.trim()}
            className="w-full py-3 rounded-full bg-yellow-400 text-white font-bold text-lg disabled:opacity-50"
          >
            {isPending ? "..." : "つなげる"}
          </button>
          <button
            onClick={() => { setMode("select"); setError(null); }}
            className="text-gray-400 text-sm"
          >
            もどる
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex flex-col items-center justify-center px-6 gap-6">
      <div className="bg-white/80 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-5xl">🌟</div>
        <p className="font-bold text-xl text-gray-700 text-center">がまん貯金をはじめよう</p>
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="w-full py-4 rounded-full bg-gradient-to-b from-yellow-400 to-orange-400 text-white font-bold text-lg shadow-md disabled:opacity-50"
        >
          {isPending ? "..." : "あたらしくはじめる"}
        </button>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">または</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          onClick={() => setMode("join")}
          className="w-full py-4 rounded-full bg-white border-2 border-yellow-400 text-yellow-600 font-bold text-lg"
        >
          共有コードでつなげる
        </button>
      </div>
    </main>
  );
}
