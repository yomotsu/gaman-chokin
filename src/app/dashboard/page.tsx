"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { COOLDOWN_DAYS } from "@/lib/constants";
import CoinDisplay from "@/components/CoinDisplay";
import CoinButton from "@/components/CoinButton";
import UseCoinsButton from "@/components/UseCoinsButton";
import ClickHistory from "@/components/ClickHistory";
import ChildSetup from "@/components/ChildSetup";
import ShareCode from "@/components/ShareCode";
import ParentMenu from "@/components/ParentMenu";
import Image from "next/image";

export default function DashboardPage() {
  const data = useQuery(api.children.getDashboardData);

  // 親メニュー
  const [showParentMenu, setShowParentMenu] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // クールタイム無効（ローカルのみ）
  const [overrideExpiresAt, setOverrideExpiresAt] = useState<number | null>(null);
  const overrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overrideActive = overrideExpiresAt !== null && overrideExpiresAt > Date.now();

  function handleSecretTap() {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      setShowParentMenu(true);
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  }

  function activateOverride() {
    const expiresAt = Date.now() + 60 * 1000;
    setOverrideExpiresAt(expiresAt);
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    overrideTimerRef.current = setTimeout(() => {
      setOverrideExpiresAt(null);
    }, 60 * 1000);
  }

  function consumeOverride() {
    setOverrideExpiresAt(null);
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
  }

  if (data === undefined) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex items-center justify-center">
        <span className="text-4xl animate-spin">⭐</span>
      </main>
    );
  }

  if (data.childId === null) {
    return <ChildSetup />;
  }

  const lastActionAt = data.clickHistory[0]?.clickedAt ?? null;
  const diffDays = lastActionAt
    ? (Date.now() - new Date(lastActionAt).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  const cooldownActive = diffDays < COOLDOWN_DAYS;
  const canClick = !cooldownActive || overrideActive;
  const daysRemaining = cooldownActive ? Math.ceil(COOLDOWN_DAYS - diffDays) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex flex-col items-center px-4 py-6 gap-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between w-full max-w-md">
        <button
          onClick={handleSecretTap}
          className="flex items-center gap-2 active:opacity-70"
        >
          <Image src="/icon.png" alt="がまん貯金" width={40} height={40} className="rounded-lg" />
          <h1 className="text-2xl font-black text-orange-500 drop-shadow">がまん貯金</h1>
        </button>
        <UserButton />
      </div>

      {/* コイン表示 */}
      <div className="bg-white/80 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6 w-full max-w-md">
        <CoinDisplay gCoins={data.gCoins} />
        <CoinButton
          canClick={canClick}
          daysRemaining={daysRemaining}
          skipCooldown={overrideActive}
          onAfterClick={consumeOverride}
        />
        <UseCoinsButton gCoins={data.gCoins} canClick={canClick} />
      </div>

      {/* ログ */}
      <ClickHistory history={data.clickHistory} />

      {/* 共有コード */}
      <ShareCode childId={data.childId} />

      {/* 親メニュー */}
      {showParentMenu && (
        <ParentMenu
          onClose={() => setShowParentMenu(false)}
          overrideActive={overrideActive}
          overrideExpiresAt={overrideExpiresAt}
          onActivateOverride={activateOverride}
        />
      )}
    </main>
  );
}
