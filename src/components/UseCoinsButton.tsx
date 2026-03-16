"use client";

import { useTransition, useState } from "react";
import { useCoins } from "@/actions/coinActions";

interface UseCoinsButtonProps {
  gCoins: number;
  canClick: boolean;
}

export default function UseCoinsButton({ gCoins, canClick }: UseCoinsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleConfirm() {
    setShowConfirm(false);
    startTransition(async () => {
      const result = await useCoins();
      showToast(result.message);
    });
  }

  if (gCoins <= 0) return null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending || !canClick}
        className="mt-4 px-8 py-3 rounded-full bg-pink-400 hover:bg-pink-300 text-white font-bold text-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        🎁 おかね を つかう
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 mx-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="text-5xl">🎁</div>
            <p className="text-xl font-bold text-center text-gray-800">
              {gCoins.toLocaleString()}円を<br />ぜんぶつかう？
            </p>
            <p className="text-gray-500 text-sm text-center">つかうと0になるよ</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-full bg-gray-200 text-gray-700 font-bold text-lg"
              >
                やめる
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-full bg-pink-400 text-white font-bold text-lg"
              >
                つかう！
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white border-2 border-pink-400 rounded-2xl px-6 py-3 shadow-xl text-lg font-bold text-pink-600 animate-bounce z-50">
          {toast}
        </div>
      )}
    </>
  );
}
