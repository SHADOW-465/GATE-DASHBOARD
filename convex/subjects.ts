import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Helper function to get current user
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
    
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

// Get all subjects for the current user
export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Create a new subject
export const createSubject = mutation({
  args: {
    name: v.string(),
    progress: v.number(),
    status: v.union(
      v.literal("strong"),
      v.literal("pending"),
      v.literal("weak"),
      v.literal("completed")
    ),
    weightage: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const subjectId = await ctx.db.insert("subjects", {
      userId: user._id,
      name: args.name,
      progress: args.progress,
      status: args.status,
      weightage: args.weightage,
    });

    return subjectId;
  },
});

// Update subject progress
export const updateSubjectProgress = mutation({
  args: {
    subjectId: v.id("subjects"),
    progress: v.number(),
    status: v.optional(
      v.union(
        v.literal("strong"),
        v.literal("pending"),
        v.literal("weak"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify ownership
    if (subject.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own subjects");
    }

    const updateData: any = { progress: args.progress };
    if (args.status !== undefined) {
      updateData.status = args.status;
    }

    await ctx.db.patch(args.subjectId, updateData);
    return args.subjectId;
  },
});

// Get a specific subject
export const getSubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify ownership
    if (subject.userId !== user._id) {
      throw new Error("Unauthorized: You can only access your own subjects");
    }

    return subject;
  },
});

// Update subject details
export const updateSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    progress: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("strong"),
        v.literal("pending"),
        v.literal("weak"),
        v.literal("completed")
      )
    ),
    weightage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify ownership
    if (subject.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own subjects");
    }

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.progress !== undefined) updateData.progress = args.progress;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.weightage !== undefined) updateData.weightage = args.weightage;

    await ctx.db.patch(args.subjectId, updateData);
    return args.subjectId;
  },
});

// Delete a subject
export const deleteSubject = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify ownership
    if (subject.userId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own subjects");
    }

    await ctx.db.delete(args.subjectId);
    return args.subjectId;
  },
});
