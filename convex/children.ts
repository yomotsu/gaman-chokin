import { v } from "convex/values";
import { GenericMutationCtx } from "convex/server";
import { mutation, query } from "./_generated/server";
import { DataModel, Id } from "./_generated/dataModel";

const COOLDOWN_DAYS = 7;
const COIN_REWARD = 1000;

async function getOrCreateChildId(
  ctx: GenericMutationCtx<DataModel>,
  parentClerkId: string
): Promise<Id<"children">> {
  const pc = await ctx.db
    .query("parentChildren")
    .withIndex("by_parent", (q) => q.eq("parentClerkId", parentClerkId))
    .first();

  if (pc) return pc.childId;

  const childId = await ctx.db.insert("children", { gCoins: 0 });
  await ctx.db.insert("parentChildren", { parentClerkId, childId });
  return childId;
}

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { gCoins: 0, clickHistory: [], childId: null };

    const pc = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentClerkId", identity.subject))
      .first();

    if (!pc) return { gCoins: 0, clickHistory: [], childId: null };

    const child = await ctx.db.get(pc.childId);
    if (!child) return { gCoins: 0, clickHistory: [], childId: null };

    const logs = await ctx.db
      .query("clickLogs")
      .withIndex("by_child", (q) => q.eq("childId", pc.childId))
      .order("desc")
      .take(20);

    return {
      gCoins: child.gCoins,
      clickHistory: logs.map((l) => ({
        clickedAt: l.clickedAt,
        type: l.type,
        location: l.location,
      })),
      childId: pc.childId as string,
    };
  },
});

export const createChild = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentClerkId", identity.subject))
      .first();
    if (existing) return { success: true, childId: existing.childId as string };

    const childId = await ctx.db.insert("children", { gCoins: 0 });
    await ctx.db.insert("parentChildren", {
      parentClerkId: identity.subject,
      childId,
    });
    return { success: true, childId: childId as string };
  },
});

export const linkToChild = mutation({
  args: { childId: v.string() },
  handler: async (ctx, { childId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentClerkId", identity.subject))
      .first();
    if (existing) return { success: false, message: "すでに子どもと紐付いています" };

    const child = await ctx.db.get(childId as Id<"children">);
    if (!child) return { success: false, message: "そのコードは見つかりませんでした" };

    await ctx.db.insert("parentChildren", {
      parentClerkId: identity.subject,
      childId: childId as Id<"children">,
    });
    return { success: true, message: "紐付け完了！" };
  },
});

export const addCoin = mutation({
  args: {
    location: v.union(v.string(), v.null()),
    skipCooldown: v.optional(v.boolean()),
  },
  handler: async (ctx, { location, skipCooldown }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false };

    const childId = await getOrCreateChildId(ctx, identity.subject);

    if (!skipCooldown) {
      const lastLog = await ctx.db
        .query("clickLogs")
        .withIndex("by_child", (q) => q.eq("childId", childId))
        .order("desc")
        .first();

      if (lastLog) {
        const diffDays =
          (Date.now() - new Date(lastLog.clickedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (diffDays < COOLDOWN_DAYS) {
          return { success: false };
        }
      }
    }

    const now = new Date().toISOString();
    await ctx.db.insert("clickLogs", {
      childId,
      clickedAt: now,
      type: "earned",
      location,
    });

    const child = await ctx.db.get(childId);
    await ctx.db.patch(childId, { gCoins: (child?.gCoins ?? 0) + COIN_REWARD });

    return { success: true };
  },
});

export const spendCoins = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const pc = await ctx.db
      .query("parentChildren")
      .withIndex("by_parent", (q) => q.eq("parentClerkId", identity.subject))
      .first();

    if (!pc) return;

    const child = await ctx.db.get(pc.childId);
    if (!child || child.gCoins <= 0) return;

    const now = new Date().toISOString();
    await ctx.db.insert("clickLogs", {
      childId: pc.childId,
      clickedAt: now,
      type: "spent",
      location: null,
    });
    await ctx.db.patch(pc.childId, { gCoins: 0 });
  },
});
