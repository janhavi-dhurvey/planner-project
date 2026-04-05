import Deadline from "../models/Deadline.js";

/* =========================================
   GET ALL DEADLINES (SORTED BY DATE)
   ========================================= */
export const getDeadlines = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch active deadlines, sorted by closest due date
    const deadlines = await Deadline.find({ 
      userId, 
      isCompleted: false 
    })
    .sort({ dueDate: 1 })
    .lean({ virtuals: true }); // Important: allows frontend to see "daysRemaining"

    res.json(deadlines);

  } catch (error) {
    console.error("Fetch deadlines error:", error);
    res.status(500).json({ error: "Failed to fetch deadlines" });
  }
};

/* =========================================
   CREATE DEADLINE
   ========================================= */
export const createDeadline = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, dueDate, category, priority, description } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: "Title and Due Date are required" });
    }

    const deadline = await Deadline.create({
      userId,
      title: title.trim(),
      dueDate: new Date(dueDate),
      category: category || "General",
      priority: priority || "High",
      description: description || ""
    });

    res.status(201).json(deadline);

  } catch (error) {
    console.error("Create deadline error:", error);
    res.status(500).json({ error: "Failed to create deadline" });
  }
};

/* =========================================
   UPDATE DEADLINE (MANUAL EDITING)
   ========================================= */
export const updateDeadline = async (req, res) => {
  try {
    const userId = req.userId;
    const deadlineId = req.params.id;

    const deadline = await Deadline.findOne({ _id: deadlineId, userId });

    if (!deadline) {
      return res.status(404).json({ error: "Deadline not found" });
    }

    const updatedDeadline = await Deadline.findByIdAndUpdate(
      deadlineId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedDeadline);

  } catch (error) {
    console.error("Update deadline error:", error);
    res.status(500).json({ error: "Failed to update deadline" });
  }
};

/* =========================================
   DELETE DEADLINE
   ========================================= */
export const deleteDeadline = async (req, res) => {
  try {
    const userId = req.userId;
    const deadlineId = req.params.id;

    const result = await Deadline.findOneAndDelete({ _id: deadlineId, userId });

    if (!result) {
      return res.status(404).json({ error: "Deadline not found" });
    }

    res.json({ message: "Deadline removed successfully" });

  } catch (error) {
    console.error("Delete deadline error:", error);
    res.status(500).json({ error: "Failed to delete deadline" });
  }
};

/* =========================================
   MARK AS COMPLETED
   ========================================= */
export const toggleComplete = async (req, res) => {
  try {
    const userId = req.userId;
    const deadlineId = req.params.id;

    const deadline = await Deadline.findOne({ _id: deadlineId, userId });

    if (!deadline) {
      return res.status(404).json({ error: "Deadline not found" });
    }

    deadline.isCompleted = !deadline.isCompleted;
    await deadline.save();

    res.json(deadline);

  } catch (error) {
    console.error("Toggle complete error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};