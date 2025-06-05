import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if user is admin
async function isAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .first();
  
  return userRole?.role === "admin";
}

// Get current user
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return await ctx.db.get(userId);
}

// Admin: Assign information to NFC card
export const assignCard = mutation({
  args: {
    nfcId: v.string(),
    holderName: v.string(),
    holderEmail: v.optional(v.string()),
    holderPhone: v.optional(v.string()),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    employeeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can assign cards");
    }

    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if card already exists
    const existingCard = await ctx.db
      .query("nfcCards")
      .withIndex("by_nfc_id", (q) => q.eq("nfcId", args.nfcId))
      .first();

    if (existingCard) {
      throw new Error("This NFC card has already been assigned and cannot be changed");
    }

    return await ctx.db.insert("nfcCards", {
      nfcId: args.nfcId,
      assignedBy: user._id,
      holderName: args.holderName,
      holderEmail: args.holderEmail,
      holderPhone: args.holderPhone,
      department: args.department,
      position: args.position,
      employeeId: args.employeeId,
      isActive: true,
      assignedAt: Date.now(),
    });
  },
});

// Get card information by NFC ID (for scanning)
export const getCardInfo = query({
  args: { nfcId: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("nfcCards")
      .withIndex("by_nfc_id", (q) => q.eq("nfcId", args.nfcId))
      .first();

    if (!card || !card.isActive) {
      return null;
    }

    return {
      holderName: card.holderName,
      holderEmail: card.holderEmail,
      holderPhone: card.holderPhone,
      department: card.department,
      position: card.position,
      employeeId: card.employeeId,
      assignedAt: card.assignedAt,
    };
  },
});

// Admin: List all assigned cards
export const listAllCards = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can view all cards");
    }

    const cards = await ctx.db
      .query("nfcCards")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return Promise.all(
      cards.map(async (card) => {
        const assignedBy = await ctx.db.get(card.assignedBy);
        return {
          ...card,
          assignedByEmail: assignedBy?.email,
        };
      })
    );
  },
});

// Admin: Deactivate card
export const deactivateCard = mutation({
  args: { cardId: v.id("nfcCards") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can deactivate cards");
    }

    await ctx.db.patch(args.cardId, { isActive: false });
  },
});

// Set user role (for initial admin setup)
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    // Check if there are any admins yet
    const existingAdmins = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    // If no admins exist, allow anyone to create the first admin
    // Otherwise, only admins can set roles
    if (existingAdmins.length > 0 && !(await isAdmin(ctx))) {
      throw new Error("Only admins can set user roles");
    }

    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
      });
    }
  },
});

// Get current user role
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return userRole?.role || "user";
  },
});
