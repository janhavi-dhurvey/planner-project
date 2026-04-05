import express from "express";
import { 
  getDeadlines, 
  createDeadline, 
  updateDeadline, 
  deleteDeadline, 
  toggleComplete 
} from "../controllers/deadlineController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   DEADLINE ROUTES (PROTECTED)
   ========================================= */

// Apply authMiddleware to all deadline routes
router.use(authMiddleware);

// GET all deadlines for the logged-in user
router.get("/", getDeadlines);

// POST a new deadline (Manual or AI-triggered)
router.post("/", createDeadline);

// PATCH/PUT to update a specific deadline
router.put("/:id", updateDeadline);

// DELETE a specific deadline
router.delete("/:id", deleteDeadline);

// PATCH to toggle completion status (Check/Uncheck)
router.patch("/:id/complete", toggleComplete);

export default router;