import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  nfcCards: defineTable({
    nfcId: v.string(), // Unique NFC tag identifier
    assignedBy: v.id("users"), // Admin who assigned the card
    holderName: v.string(),
    holderEmail: v.optional(v.string()),
    holderPhone: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    isActive: v.boolean(),
    assignedAt: v.number(),
  })
    .index("by_nfc_id", ["nfcId"])
    .index("by_assigned_by", ["assignedBy"])
    .index("by_active", ["isActive"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_user_id", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
