"use client";

import { useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CoinButtonProps {
  canClick: boolean;
  daysRemaining: number;
  skipCooldown?: boolean;
  onAfterClick?: () => void;
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
          const place = [
            addr.state,
            addr.city || addr.county || addr.town || addr.village,
            addr.suburb || addr.quarter || addr.neighbourhood,
          ]
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

export default function CoinButton({ canClick, daysRemaining, skipCooldown, onAfterClick }: CoinButtonProps) {
  const [isPending, startTransition] = useTransition();
  const addCoin = useMutation(api.children.addCoin);

  function handleClick() {
    startTransition(async () => {
      const location = await getLocation();
      const result = await addCoin({ location, skipCooldown });
      if (result.success) onAfterClick?.();
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
    </div>
  );
}
