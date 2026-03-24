import mongoose from "mongoose";

/* =========================================
   MESSAGE SCHEMA
========================================= */

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    /* ✅ SAFE STRUCTURED DATA */
    structuredData: {
      type: [mongoose.Schema.Types.Mixed],
      default: undefined
    }
  },
  { _id: false }
);

/* =========================================
   CHAT SCHEMA
========================================= */

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: 120
    },

    messages: {
      type: [MessageSchema],
      default: []
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/* =========================================
   INDEXES
========================================= */

ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, lastMessageAt: -1 });

/* =========================================
   🔥 SAFE PRE-SAVE HOOK (FIXED)
========================================= */

ChatSchema.pre("save", function (next) {
  try {

    if (!Array.isArray(this.messages)) {
      this.messages = [];
    }

    this.messages = this.messages.map(msg => ({
      role: msg.role || "assistant",
      content: msg.content || "",
      structuredData: Array.isArray(msg.structuredData)
        ? msg.structuredData
        : undefined
    }));

    this.lastMessageAt = new Date();

    // ✅ FIX: handle both cases safely
    if (typeof next === "function") {
      next();
    }

  } catch (err) {
    console.error("Chat schema error:", err.message);

    if (typeof next === "function") {
      next();
    }
  }
});

/* =========================================
   EXPORT MODEL
========================================= */

const Chat =
  mongoose.models.Chat ||
  mongoose.model("Chat", ChatSchema);

export default Chat;