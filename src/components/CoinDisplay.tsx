import Image from "next/image";

interface CoinDisplayProps {
  gCoins: number;
}

export default function CoinDisplay({ gCoins }: CoinDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src="/logo.png" alt="がまん貯金" width={512} height={256} className="block w-full max-w-3xs mb-2" />
      <div className="text-center">
        <p className="text-lg font-bold text-yellow-700">たまった おかね</p>
        <p className="text-5xl font-black text-yellow-500 drop-shadow-md">
          {gCoins.toLocaleString()}
          <span className="text-xl text-yellow-600 font-semibold">円</span>
        </p>
      </div>
    </div>
  );
}
