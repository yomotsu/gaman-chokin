import { UserButton } from "@clerk/nextjs";
import { getDashboardData } from "@/actions/coinActions";
import { COOLDOWN_DAYS } from "@/lib/constants";
import CoinDisplay from "@/components/CoinDisplay";
import CoinButton from "@/components/CoinButton";
import UseCoinsButton from "@/components/UseCoinsButton";
import ClickHistory from "@/components/ClickHistory";
import Image from "next/image";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const lastEarnedAt = data.clickHistory.find((l) => l.type === "earned")?.clickedAt ?? null;
  const diffDays = lastEarnedAt
    ? (Date.now() - new Date(lastEarnedAt).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  const canClick = diffDays >= COOLDOWN_DAYS;
  const daysRemaining = canClick ? 0 : Math.ceil(COOLDOWN_DAYS - diffDays);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex flex-col items-center px-4 py-6 gap-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="がまん貯金" width={40} height={40} className="rounded-lg" />
          <h1 className="text-2xl font-black text-orange-500 drop-shadow">がまん貯金</h1>
        </div>
        <UserButton />
      </div>

      {/* コイン表示 */}
      <div className="bg-white/80 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6 w-full max-w-md">
        <CoinDisplay gCoins={data.gCoins} />

        {/* がまんボタン */}
        <CoinButton canClick={canClick} daysRemaining={daysRemaining} />

        {/* つかうボタン */}
        <UseCoinsButton gCoins={data.gCoins} canClick={canClick} />
      </div>

      {/* ログ */}
      <ClickHistory history={data.clickHistory} />
    </main>
  );
}
