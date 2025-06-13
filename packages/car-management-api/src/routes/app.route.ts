import { login } from "@/controllers/app/auth.controller";
import { getCurrentUser, updatePhoneNumber } from "@/controllers/app/user.controller";
import { authenticate } from "@/middleware/app/auth.middleware";
import { Router } from "express";

const router = Router();

// Auth Routes
// POST /api/app/auth/login - miniprogram user login
router.post("/auth/login", login);

// User Routes
router.get("/users/current", getCurrentUser);
router.post("/users/current/phone-number", updatePhoneNumber);

// Apply authentication middleware to all routes below
router.use(authenticate);

export default router;
