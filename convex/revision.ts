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

// Flashcard Deck Management

// Get all flashcard decks for the current user
export const getFlashcardDecks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get flashcard decks by subject
export const getFlashcardDecksBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcardDecks")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
  },
});

// Create a new flashcard deck
export const createFlashcardDeck = mutation({
  args: {
    name: v.string(),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const deckId = await ctx.db.insert("flashcardDecks", {
      userId: user._id,
      name: args.name,
      subjectId: args.subjectId,
    });

    return deckId;
  },
});

// Update flashcard deck
export const updateFlashcardDeck = mutation({
  args: {
    deckId: v.id("flashcardDecks"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error("Flashcard deck not found");
    }

    // Verify ownership
    if (deck.userId !== user._id) {
      throw new Error("Unauthorized: You can only update your own flashcard decks");
    }

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;

    await ctx.db.patch(args.deckId, updateData);
    return args.deckId;
  },
});

// Delete flashcard deck
export const deleteFlashcardDeck = mutation({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error("Flashcard deck not found");
    }

    // Verify ownership
    if (deck.userId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own flashcard decks");
    }

    // Also delete all flashcards in this deck
    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    for (const flashcard of flashcards) {
      await ctx.db.delete(flashcard._id);
    }

    await ctx.db.delete(args.deckId);
    return args.deckId;
  },
});

// Flashcard Management

// Get all flashcards in a deck
export const getFlashcards = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
  },
});

// Create a new flashcard
export const createFlashcard = mutation({
  args: {
    deckId: v.id("flashcardDecks"),
    front: v.string(),
    back: v.string(),
    masteryLevel: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("mastered")
    ),
  },
  handler: async (ctx, args) => {
    const flashcardId = await ctx.db.insert("flashcards", {
      deckId: args.deckId,
      front: args.front,
      back: args.back,
      masteryLevel: args.masteryLevel,
    });

    return flashcardId;
  },
});

// Update flashcard
export const updateFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    front: v.optional(v.string()),
    back: v.optional(v.string()),
    masteryLevel: v.optional(
      v.union(
        v.literal("new"),
        v.literal("learning"),
        v.literal("mastered")
      )
    ),
  },
  handler: async (ctx, args) => {
    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard) {
      throw new Error("Flashcard not found");
    }

    const updateData: any = {};
    if (args.front !== undefined) updateData.front = args.front;
    if (args.back !== undefined) updateData.back = args.back;
    if (args.masteryLevel !== undefined) updateData.masteryLevel = args.masteryLevel;

    await ctx.db.patch(args.flashcardId, updateData);
    return args.flashcardId;
  },
});

// Delete flashcard
export const deleteFlashcard = mutation({
  args: { flashcardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard) {
      throw new Error("Flashcard not found");
    }

    await ctx.db.delete(args.flashcardId);
    return args.flashcardId;
  },
});

// Get flashcards by mastery level
export const getFlashcardsByMasteryLevel = query({
  args: { 
    deckId: v.id("flashcardDecks"),
    masteryLevel: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("mastered")
    )
  },
  handler: async (ctx, args) => {
    const allFlashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    return allFlashcards.filter(flashcard => flashcard.masteryLevel === args.masteryLevel);
  },
});

// Weak Topics Analysis

// Get weak topics (analyzes test results to identify topics with low accuracy)
export const getWeakTopics = query({
  args: {},
  handler: async (ctx) => {
    // For now, return mock data. This can be enhanced later with actual analysis
    // of test results and performance data
    const mockWeakTopics = [
      {
        topic: "Digital Electronics",
        subject: "Electronics",
        accuracy: 45,
        attempts: 12,
        trend: "declining",
        lastStudied: "2024-01-15",
        recommendedActions: ["Review fundamentals", "Practice more problems", "Watch video tutorials"]
      },
      {
        topic: "Control Systems",
        subject: "Control Engineering",
        accuracy: 38,
        attempts: 8,
        trend: "stable",
        lastStudied: "2024-01-10",
        recommendedActions: ["Focus on theory", "Solve previous year questions", "Join study group"]
      },
      {
        topic: "Signals and Systems",
        subject: "Communication",
        accuracy: 52,
        attempts: 15,
        trend: "improving",
        lastStudied: "2024-01-20",
        recommendedActions: ["Continue current study plan", "Take practice tests", "Review weak areas"]
      }
    ];

    return mockWeakTopics;
  },
});

// Get revision recommendations based on weak topics
export const getRevisionRecommendations = query({
  args: {},
  handler: async (ctx) => {
    // Get weak topics data (same logic as getWeakTopics)
    const mockWeakTopics = [
      {
        topic: "Digital Electronics",
        subject: "Electronics",
        accuracy: 45,
        attempts: 12,
        trend: "declining",
        lastStudied: "2024-01-15",
        recommendedActions: ["Review fundamentals", "Practice more problems", "Watch video tutorials"]
      },
      {
        topic: "Control Systems",
        subject: "Control Engineering",
        accuracy: 38,
        attempts: 8,
        trend: "stable",
        lastStudied: "2024-01-10",
        recommendedActions: ["Focus on theory", "Solve previous year questions", "Join study group"]
      },
      {
        topic: "Signals and Systems",
        subject: "Communication",
        accuracy: 52,
        attempts: 15,
        trend: "improving",
        lastStudied: "2024-01-20",
        recommendedActions: ["Continue current study plan", "Take practice tests", "Review weak areas"]
      }
    ];
    
    // Generate recommendations based on weak topics
    const recommendations = mockWeakTopics.map((topic: any) => ({
      topic: topic.topic,
      priority: topic.accuracy < 40 ? "high" : topic.accuracy < 60 ? "medium" : "low",
      studyTime: topic.accuracy < 40 ? "2-3 hours daily" : "1-2 hours daily",
      resources: [
        "Textbook chapters",
        "Video lectures",
        "Practice problems",
        "Previous year questions"
      ],
      deadline: new Date(Date.now() + (topic.accuracy < 40 ? 3 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    return recommendations;
  },
});
