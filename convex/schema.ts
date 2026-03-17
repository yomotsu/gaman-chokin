import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  children: defineTable({
    gCoins: v.number(),
  }),
  parentChildren: defineTable({
    parentClerkId: v.string(),
    childId: v.id("children"),
  }).index("by_parent", ["parentClerkId"]),
  clickLogs: defineTable({
    childId: v.id("children"),
    clickedAt: v.string(),
    type: v.union(v.literal("earned"), v.literal("spent")),
    location: v.union(v.string(), v.null()),
  }).index("by_child", ["childId"]),
});
