import mongoose from "mongoose";

/* =========================================
   DEADLINE SCHEMA
   ========================================= */

const DeadlineSchema = new mongoose.Schema(
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
      maxlength: 100,
      placeholder: "e.g., Physics Final Exam"
    },

    /* =========================================
       THE TARGET DATE
       ========================================= */
    dueDate: {
      type: Date,
      required: true,
      index: true
    },

    /* =========================================
       METADATA (FOR AI CATEGORIZATION)
       ========================================= */
    category: {
      type: String,
      default: "Exam", // Exam, Project, Assignment, Personal
      trim: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    /* =========================================
       PRIORITY (AI USES THIS TO SCHEDULE)
       ========================================= */
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "High"
    },

    /* =========================================
       STATUS
       ========================================= */
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* =========================================
   VIRTUALS (Calculates Days Remaining)
   ========================================= */

// This allows the frontend to easily get "3 days left"
DeadlineSchema.virtual("daysRemaining").get(function () {
  if (!this.dueDate) return null;
  const today = new Date();
  const diffTime = this.dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Ensure virtuals are included in JSON
DeadlineSchema.set("toJSON", { virtuals: true });
DeadlineSchema.set("toObject", { virtuals: true });

/* =========================================
   INDEXES
   ========================================= */

DeadlineSchema.index({ userId: 1, dueDate: 1 });
DeadlineSchema.index({ userId: 1, isCompleted: 1 });

/* =========================================
   EXPORT MODEL
   ========================================= */

const Deadline =
  mongoose.models.Deadline ||
  mongoose.model("Deadline", DeadlineSchema);

export default Deadline;