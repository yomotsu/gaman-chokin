"use client";

import { useEffect, useState } from "react";

interface ParentMenuProps {
  onClose: () => void;
  overrideActive: boolean;
  overrideExpiresAt: number | null;
  onActivateOverride: () => void;
}

export default function ParentMenu({
  onClose,
  overrideActive,
  overrideExpiresAt,
  onActivateOverride,
}: ParentMenuProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!overrideActive || !overrideExpiresAt) return;
    const update = () => {
      const secs = Math.max(0, Math.ceil((overrideExpiresAt - Date.now()) / 1000));
      setRemaining(secs);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [overrideActive, overrideExpiresAt]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 mx-6 shadow-2xl flex flex-col items-center gap-5 max-w-sm w-full">
        <p className="text-xs text-gray-400 font-medium tracking-widest">親専用メニュー</p>
        <div className="text-4xl">🔧</div>

        <div className="w-full bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-3">
          <p className="font-bold text-gray-700">クールタイムを一時無効にする</p>
          <p className="text-xs text-gray-400 text-center">
            次回のがまんボタンクリック、または1分間 有効
          </p>

          {overrideActive ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-green-500 font-bold text-sm">✓ 有効中</span>
              <span className="text-gray-400 text-xs">{remaining}秒後に自動解除</span>
            </div>
          ) : (
            <button
              onClick={() => { onActivateOverride(); onClose(); }}
              className="px-8 py-3 rounded-full bg-orange-400 text-white font-bold shadow-md active:scale-95 transition-all"
            >
              無効にする
            </button>
          )}
        </div>

        <button onClick={onClose} className="text-gray-400 text-sm mt-2">
          とじる
        </button>
      </div>
    </div>
  );
}
