import Goal from "../models/Goal.js";

/* =========================================
   NORMALIZE TIME (SAFE FIX)
========================================= */
const normalizeTime = (time) => {
  if (!time || typeof time !== "string") return "";

  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  const parts = time.split(":");
  if (parts.length !== 2) return time;

  let hour = parseInt(parts[0]);
  const minute = parts[1];

  if (isNaN(hour)) return time;

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
};

/* =========================================
   GET GOALS (UPDATED FOR CALENDAR FILTERING)
========================================= */
export const getGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query; // Get date from query params (e.g. ?date=2026-04-06)

    let query = { userId };

    // If a date is provided, filter goals for that specific day (start of day to end of day)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const goals = await Goal.find(query)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json(goals);

  } catch (error) {
    console.error("Fetch goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

/* =========================================
   CREATE GOAL (UPDATED TO ACCEPT DATE)
========================================= */
export const createGoal = async (req, res) => {
  try {
    const userId = req.userId;

    let {
      title,
      time,
      duration,
      category,
      color,
      date // Accept date from request body
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Goal title required" });
    }

    title = title.trim();
    duration = Number(duration) || 60;

    if (duration < 5) duration = 5;
    if (duration > 600) duration = 600;

    time = normalizeTime(time);

    const count = await Goal.countDocuments({ userId });

    const goal = await Goal.create({
      userId,
      title,
      time,
      duration,
      category: category || "📘",
      color: color || "#89CFF0",
      status: "pending",
      order: count,
      date: date || new Date() // Use provided date or default to now
    });

    res.status(201).json(goal);

  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
};

/* =========================================
   UPDATE GOAL
========================================= */
export const updateGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const updates = { ...req.body };

    if (updates.time) {
      updates.time = normalizeTime(updates.time);
    }

    if (updates.duration) {
      updates.duration = Number(updates.duration);
      if (updates.duration < 5) updates.duration = 5;
      if (updates.duration > 600) updates.duration = 600;
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      updates,
      { new: true }
    );

    res.json(updatedGoal);

  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
};

/* =========================================
   DELETE GOAL
========================================= */
export const deleteGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    await Goal.findByIdAndDelete(goalId);

    /* 🔥 REORDER AFTER DELETE */
    const remainingGoals = await Goal.find({ userId })
      .sort({ order: 1 });

    for (let i = 0; i < remainingGoals.length; i++) {
      remainingGoals[i].order = i;
      await remainingGoals[i].save();
    }

    res.json({ message: "Goal deleted" });

  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
};

/* =========================================
   COMPLETE GOAL
========================================= */
export const completeGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    goal.status = "completed";
    goal.completedAt = new Date();

    await goal.save();

    res.json(goal);

  } catch (error) {
    console.error("Complete goal error:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
};

/* =========================================
   RESET GOALS
========================================= */
export const resetGoals = async (req, res) => {
  try {
    const userId = req.userId;

    await Goal.deleteMany({ userId });

    res.json({ message: "All goals cleared" });

  } catch (error) {
    console.error("Reset goals error:", error);
    res.status(500).json({ error: "Failed to reset goals" });
  }
};

/* =========================================
   REORDER GOALS
========================================= */
export const reorderGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await Goal.findOneAndUpdate(
        { _id: orderedIds[i], userId },
        { order: i }
      );
    }

    res.json({ message: "Goals reordered successfully" });

  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ error: "Failed to reorder goals" });
  }
};