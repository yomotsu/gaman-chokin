import { UserButton } from "@clerk/nextjs";
import { getDashboardData } from "@/actions/coinActions";
import CoinDisplay from "@/components/CoinDisplay";
import CoinButton from "@/components/CoinButton";
import UseCoinsButton from "@/components/UseCoinsButton";
import ClickHistory from "@/components/ClickHistory";
import Image from "next/image";

export default async function DashboardPage() {
  const data = await getDashboardData();

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
        <CoinButton canClick={data.canClick} daysRemaining={data.daysRemaining} />

        {/* つかうボタン */}
        <UseCoinsButton gCoins={data.gCoins} />
      </div>

      {/* ログ */}
      <ClickHistory history={data.clickHistory} />
    </main>
  );
}
