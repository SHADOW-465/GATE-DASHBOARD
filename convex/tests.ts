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

// Get all tests for the current user
export const getTests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Create a new test
export const createTest = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("Full Length"),
      v.literal("Subject Test"),
      v.literal("PYQ")
    ),
    status: v.union(
      v.literal("attempted"),
      v.literal("not_attempted")
    ),
    score: v.optional(v.number()),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const testId = await ctx.db.insert("tests", {
      userId: user._id,
      name: args.name,
      type: args.type,
      status: args.status,
      score: args.score,
      accuracy: args.accuracy,
    });

    return testId;
  },
});

// Log test result (add or update test with score and accuracy)
export const logTestResult = mutation({
  args: {
    testId: v.id("tests"),
    score: v.number(),
    accuracy: v.number(),
    status: v.union(
      v.literal("attempted"),
      v.literal("not_attempted")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Verify ownership
    if (test.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own tests");
    }

    await ctx.db.patch(args.testId, {
      score: args.score,
      accuracy: args.accuracy,
      status: args.status,
    });

    return args.testId;
  },
});

// Update test details
export const updateTest = mutation({
  args: {
    testId: v.id("tests"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Full Length"),
        v.literal("Subject Test"),
        v.literal("PYQ")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("attempted"),
        v.literal("not_attempted")
      )
    ),
    score: v.optional(v.number()),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Verify ownership
    if (test.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own tests");
    }

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.score !== undefined) updateData.score = args.score;
    if (args.accuracy !== undefined) updateData.accuracy = args.accuracy;

    await ctx.db.patch(args.testId, updateData);
    return args.testId;
  },
});

// Delete a test
export const deleteTest = mutation({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Verify ownership
    if (test.userId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own tests");
    }

    await ctx.db.delete(args.testId);
    return args.testId;
  },
});

// Get performance trends (calculate trends from test scores)
export const getPerformanceTrends = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const tests = await ctx.db
      .query("tests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "attempted"))
      .collect();

    // Sort by creation date to get chronological order
    const sortedTests = tests.sort((a, b) => a._creationTime - b._creationTime);

    // Calculate trends
    const trends = {
      scoreTrend: sortedTests.map(test => ({
        date: new Date(test._creationTime).toISOString().split('T')[0],
        score: test.score || 0,
        accuracy: test.accuracy || 0,
      })),
      averageScore: sortedTests.length > 0 
        ? sortedTests.reduce((sum, test) => sum + (test.score || 0), 0) / sortedTests.length 
        : 0,
      averageAccuracy: sortedTests.length > 0 
        ? sortedTests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / sortedTests.length 
        : 0,
      totalTests: sortedTests.length,
      improvement: sortedTests.length >= 2 
        ? (sortedTests[sortedTests.length - 1].score || 0) - (sortedTests[0].score || 0)
        : 0,
    };

    return trends;
  },
});

// Get tests by type
export const getTestsByType = query({
  args: { 
    type: v.union(
      v.literal("Full Length"),
      v.literal("Subject Test"),
      v.literal("PYQ")
    )
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const allTests = await ctx.db
      .query("tests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allTests.filter(test => test.type === args.type);
  },
});

// Get attempted tests only
export const getAttemptedTests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "attempted"))
      .collect();
  },
});
