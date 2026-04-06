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
   HELPER: GET NUMERIC TIME FOR SORTING
========================================= */
const getTimeSortValue = (timeStr) => {
  if (!timeStr) return 0;
  try {
    const [time, period] = timeStr.split(" ");
    let [hour, minute] = time.split(":").map(Number);
    
    // LOGIC FIX: Treat 12:00 AM as the end of the day (24:00) 
    // so it doesn't jump to the top of the list.
    if (period === "AM" && hour === 12) {
      hour = 24; 
    } else if (period === "PM" && hour < 12) {
      hour += 12;
    }
    
    return hour * 60 + minute;
  } catch {
    return 0;
  }
};

/* =========================================
   GET GOALS (UPDATED WITH SMART SORTING)
========================================= */
export const getGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    let query = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const goals = await Goal.find(query).lean();

    // Sort primarily by Time Value, and secondarily by the original AI creation order
    goals.sort((a, b) => {
      const timeDiff = getTimeSortValue(a.time) - getTimeSortValue(b.time);
      if (timeDiff !== 0) return timeDiff;
      return (a.order || 0) - (b.order || 0);
    });

    res.json(goals);

  } catch (error) {
    console.error("Fetch goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

/* =========================================
   CREATE GOAL (WITH DUPLICATE PROTECTION)
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
      date 
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Goal title required" });
    }

    title = title.trim();
    duration = Number(duration) || 60;
    time = normalizeTime(time);
    
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Goal.findOne({
      userId,
      time,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      existing.title = title;
      existing.duration = duration;
      existing.category = category || "📘";
      existing.color = color || "#89CFF0";
      await existing.save();
      return res.status(200).json(existing);
    }

    const count = await Goal.countDocuments({ userId, date: { $gte: startOfDay, $lte: endOfDay } });

    const goal = await Goal.create({
      userId,
      title,
      time,
      duration,
      category: category || "📘",
      color: color || "#89CFF0",
      status: "pending",
      order: count,
      date: targetDate
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

    const remainingGoals = await Goal.find({ userId }).sort({ order: 1 });

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
   RESET DAILY GOALS
========================================= */
export const resetDailyGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Goal.deleteMany({ 
      userId, 
      date: { $gte: startOfDay, $lte: endOfDay } 
    });

    res.json({ message: `Success: Cleared ${result.deletedCount} goals for ${date}` });

  } catch (error) {
    console.error("Reset daily goals error:", error);
    res.status(500).json({ error: "Failed to reset daily goals" });
  }
};

/* =========================================
   RESET ALL GOALS
========================================= */
export const resetGoals = async (req, res) => {
  try {
    const userId = req.userId;
    await Goal.deleteMany({ userId });
    res.json({ message: "All goals cleared" });
  } catch (error) {
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

    for (let i = 0; i < orderedIds.length; i++) {
      await Goal.findOneAndUpdate(
        { _id: orderedIds[i], userId },
        { order: i }
      );
    }

    res.json({ message: "Goals reordered" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder" });
  }
};