import Goal from "../models/Goal.js";

/* =========================================
   NORMALIZE TIME
========================================= */
const normalizeTime = (time) => {
  if (!time) return "";

  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  const parts = time.split(":");
  if (parts.length !== 2) return time;

  let hour = parseInt(parts[0]);
  const minute = parts[1];

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
};

/* =========================================
   GET GOALS (🔥 FINAL FIX)
========================================= */
export const getGoals = async (req, res) => {
  try {
    const userId = req.userId;

    /* 🔥 SORT DIRECTLY FROM DB */
    const goals = await Goal.find({ userId })
      .sort({ order: 1 })   // ✅ MOST IMPORTANT LINE
      .lean();

    res.json(goals);

  } catch (error) {
    console.error("Fetch goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

/* =========================================
   CREATE GOAL
========================================= */
export const createGoal = async (req, res) => {
  try {
    const userId = req.userId;

    let { title, time, duration, category, color } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Goal title required" });
    }

    title = title.trim();
    duration = Number(duration) || 60;

    if (duration < 5) duration = 5;
    if (duration > 600) duration = 600;

    time = normalizeTime(time);

    /* 🔥 GET LAST ORDER */
    const lastGoal = await Goal.findOne({ userId })
      .sort({ order: -1 });

    const nextOrder = lastGoal ? (lastGoal.order || 0) + 1 : 0;

    const goal = await Goal.create({
      userId,
      title,
      time,
      duration,
      category: category || "📘",
      color: color || "#89CFF0",
      status: "pending",
      order: nextOrder
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