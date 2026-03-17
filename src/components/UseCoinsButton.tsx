"use client";

import { useTransition, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UseCoinsButtonProps {
  gCoins: number;
  canClick: boolean;
}

export default function UseCoinsButton({ gCoins, canClick }: UseCoinsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const spendCoins = useMutation(api.children.spendCoins);

  function handleConfirm() {
    setShowConfirm(false);
    startTransition(async () => {
      await spendCoins({});
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

    </>
  );
}
