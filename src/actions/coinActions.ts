"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const COIN_REWARD = 1000;
const COOLDOWN_DAYS = 5;

export interface ClickLog {
  clickedAt: string;
  location: string | null;
}

export interface GamanMetadata {
  gCoins: number;
  lastClickedAt: string | null;
  clickHistory: ClickLog[];
}

function getMetadata(user: { publicMetadata: Record<string, unknown> }): GamanMetadata {
  const meta = user.publicMetadata as Partial<GamanMetadata>;
  return {
    gCoins: typeof meta.gCoins === "number" ? meta.gCoins : 0,
    lastClickedAt: typeof meta.lastClickedAt === "string" ? meta.lastClickedAt : null,
    clickHistory: Array.isArray(meta.clickHistory) ? meta.clickHistory : [],
  };
}

function canClick(lastClickedAt: string | null): boolean {
  if (!lastClickedAt) return true;
  const last = new Date(lastClickedAt).getTime();
  const now = Date.now();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffDays >= COOLDOWN_DAYS;
}

function daysRemaining(lastClickedAt: string | null): number {
  if (!lastClickedAt) return 0;
  const last = new Date(lastClickedAt).getTime();
  const now = Date.now();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(COOLDOWN_DAYS - diffDays));
}

export async function addCoin(location: string | null): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "ログインしてください" };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = getMetadata(user);

  if (!canClick(meta.lastClickedAt)) {
    return { success: false, message: `まだおやすみちゅう（あと${daysRemaining(meta.lastClickedAt)}日）` };
  }

  const now = new Date().toISOString();
  const newHistory: ClickLog[] = [
    { clickedAt: now, location },
    ...meta.clickHistory,
  ].slice(0, 100); // 最大100件保持

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      gCoins: meta.gCoins + COIN_REWARD,
      lastClickedAt: now,
      clickHistory: newHistory,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, message: `${COIN_REWARD}Gコインもらったよ！` };
}

export async function useCoins(): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "ログインしてください" };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = getMetadata(user);

  if (meta.gCoins <= 0) {
    return { success: false, message: "Gコインがないよ" };
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      gCoins: 0,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Gコインをつかったよ！" };
}

export async function getDashboardData(): Promise<GamanMetadata & { canClick: boolean; daysRemaining: number }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = getMetadata(user);

  return {
    ...meta,
    canClick: canClick(meta.lastClickedAt),
    daysRemaining: daysRemaining(meta.lastClickedAt),
  };
}
