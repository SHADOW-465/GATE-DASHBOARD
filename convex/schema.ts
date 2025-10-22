import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    targetScore: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"]),

  subjects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    progress: v.number(),
    status: v.union(
      v.literal("strong"),
      v.literal("pending"),
      v.literal("weak"),
      v.literal("completed")
    ),
    weightage: v.number(),
  })
    .index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
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
  })
    .index("by_user", ["userId"])
    .index("by_user_due_date", ["userId", "dueDate"]),

  tests: defineTable({
    userId: v.id("users"),
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
  })
    .index("by_user", ["userId"]),

  flashcardDecks: defineTable({
    userId: v.id("users"),
    name: v.string(),
    subjectId: v.id("subjects"),
  })
    .index("by_user", ["userId"])
    .index("by_subject", ["subjectId"]),

  flashcards: defineTable({
    deckId: v.id("flashcardDecks"),
    front: v.string(),
    back: v.string(),
    masteryLevel: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("mastered")
    ),
  })
    .index("by_deck", ["deckId"]),
});
