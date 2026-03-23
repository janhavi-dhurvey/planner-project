import express from "express";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  resetGoals   // 🔥 NEW (IMPORTANT)
} from "../controllers/goalController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   ALL ROUTES PROTECTED
========================================= */
router.use(authMiddleware);

/* =========================================
   GET ALL GOALS
   GET /api/goals
========================================= */
router.get("/", getGoals);

/* =========================================
   CREATE GOAL
   POST /api/goals
========================================= */
router.post("/", createGoal);

/* =========================================
   UPDATE GOAL
   PUT /api/goals/:id
========================================= */
router.put("/:id", updateGoal);

/* =========================================
   DELETE GOAL
   DELETE /api/goals/:id
========================================= */
router.delete("/:id", deleteGoal);

/* =========================================
   COMPLETE GOAL
   PATCH /api/goals/:id/complete
========================================= */
router.patch("/:id/complete", completeGoal);

/* =========================================
   🔥 RESET ALL GOALS (VERY IMPORTANT)
   DELETE /api/goals/reset
========================================= */
router.delete("/reset", resetGoals);

/* =========================================
   EXPORT
========================================= */
export default router;