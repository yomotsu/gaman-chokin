"use client";

import { useTransition, useState } from "react";
import { addCoin } from "@/actions/coinActions";

interface CoinButtonProps {
  canClick: boolean;
  daysRemaining: number;
}

async function getLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ja`
          );
          const data = await res.json();
          const addr = data.address;
          // 都道府県＋市区町村レベル
          const place = [addr.state, addr.county || addr.city || addr.town || addr.village]
            .filter(Boolean)
            .join(" ");
          resolve(place || null);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null)
    );
  });
}

export default function CoinButton({ canClick, daysRemaining }: CoinButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleClick() {
    startTransition(async () => {
      const location = await getLocation();
      const result = await addCoin(location);
      showToast(result.message);
    });
  }

  if (!canClick) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="w-48 h-48 rounded-full bg-gray-300 text-gray-500 font-bold text-xl shadow-inner cursor-not-allowed flex flex-col items-center justify-center gap-1"
        >
          <span className="text-4xl">😴</span>
          <span>おやすみちゅう</span>
          <span className="text-sm">あと{daysRemaining}日</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`w-48 h-48 rounded-full font-bold text-white text-xl shadow-lg flex flex-col items-center justify-center gap-1 transition-all active:scale-95
          ${isPending
            ? "bg-yellow-300 cursor-not-allowed"
            : "bg-gradient-to-b from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 cursor-pointer"
          }`}
      >
        {isPending ? (
          <>
            <span className="text-4xl animate-spin">⭐</span>
            <span>まってね...</span>
          </>
        ) : (
          <>
            <span className="text-4xl">🌟</span>
            <span>がまんする！</span>
            <span className="text-sm">+1000円</span>
          </>
        )}
      </button>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white border-2 border-yellow-400 rounded-2xl px-6 py-3 shadow-xl text-lg font-bold text-yellow-700 animate-bounce z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
