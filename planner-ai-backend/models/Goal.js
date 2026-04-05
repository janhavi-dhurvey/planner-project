import mongoose from "mongoose";

/* =========================================
   GOAL SCHEMA
========================================= */

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Untitled Task"
    },

    /* =========================================
       CALENDAR DATE (NEW - CRUCIAL FOR CALENDAR)
    ========================================= */
    date: {
      type: Date,
      required: true,
      default: Date.now, // Defaults to today if not specified
      index: true
    },

    /* =========================================
       TIME
    ========================================= */

    time: {
      type: String,
      default: "",
      trim: true
    },

    /* =========================================
       DURATION
    ========================================= */

    duration: {
      type: Number,
      default: 60,
      min: 5,
      max: 600
    },

    category: {
      type: String,
      default: "🎯",
      trim: true
    },

    color: {
      type: String,
      default: "#C5B4E3"
    },

    /* =========================================
       STATUS
    ========================================= */

    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
      index: true
    },

    /* =========================================
       ORDER (IMPORTANT)
    ========================================= */

    order: {
      type: Number,
      default: 0,
      index: true
    },

    /* =========================================
       COMPLETION TIME
    ========================================= */

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* =========================================
   INDEXES (UPDATED FOR PERFORMANCE)
========================================= */

// Adding userId + date index so searching by calendar date is instant
GoalSchema.index({ userId: 1, date: 1 }); 
GoalSchema.index({ userId: 1, order: 1 });
GoalSchema.index({ userId: 1, createdAt: -1 });
GoalSchema.index({ userId: 1, time: 1 });
GoalSchema.index({ userId: 1, status: 1 });

/* =========================================
   EXPORT MODEL
========================================= */

const Goal =
  mongoose.models.Goal ||
  mongoose.model("Goal", GoalSchema);

export default Goal;