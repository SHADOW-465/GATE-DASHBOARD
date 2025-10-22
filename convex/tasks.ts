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

// Get all tasks for the current user
export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get tasks for a specific date
export const getTasksByDate = query({
  args: { 
    date: v.string() // ISO date string
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_due_date", (q) => 
        q.eq("userId", user._id).eq("dueDate", args.date)
      )
      .collect();
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    subjectId: v.id("subjects"),
    type: v.union(
      v.literal("Theory"),
      v.literal("PYQs"),
      v.literal("Mock Test"),
      v.literal("Revision")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("revise-again")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const taskId = await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      subjectId: args.subjectId,
      type: args.type,
      status: args.status,
      priority: args.priority,
      dueDate: args.dueDate,
    });

    return taskId;
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("revise-again")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify ownership
    if (task.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own tasks");
    }

    await ctx.db.patch(args.taskId, { status: args.status });
    return args.taskId;
  },
});

// Update task details
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(
      v.union(
        v.literal("Theory"),
        v.literal("PYQs"),
        v.literal("Mock Test"),
        v.literal("Revision")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("revise-again")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )
    ),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify ownership
    if (task.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own tasks");
    }

    const updateData: any = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.subjectId !== undefined) updateData.subjectId = args.subjectId;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.priority !== undefined) updateData.priority = args.priority;
    if (args.dueDate !== undefined) updateData.dueDate = args.dueDate;

    await ctx.db.patch(args.taskId, updateData);
    return args.taskId;
  },
});

// Delete a task
export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify ownership
    if (task.userId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own tasks");
    }

    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});

// Get tasks by subject
export const getTasksBySubject = query({
  args: { 
    subjectId: v.id("subjects")
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allTasks.filter(task => task.subjectId === args.subjectId);
  },
});

// Get tasks by type
export const getTasksByType = query({
  args: { 
    type: v.union(
      v.literal("Theory"),
      v.literal("PYQs"),
      v.literal("Mock Test"),
      v.literal("Revision")
    )
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allTasks.filter(task => task.type === args.type);
  },
});
