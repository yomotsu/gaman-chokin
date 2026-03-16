import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-yellow-100 flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2">
        <Image src="/logo.png" alt="がまん貯金" width={80} height={80} className="rounded-full shadow-lg" />
        <h1 className="text-3xl font-black text-orange-500 drop-shadow">がまん貯金</h1>
        <p className="text-gray-600">がまんしたらGコインがもらえるよ！</p>
      </div>
      <SignIn />
    </main>
  );
}
