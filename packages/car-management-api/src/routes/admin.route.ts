import { getImgUploadToken } from "@/controllers/admin/img.controller";
import { getAllUsers, getUserById } from "@/controllers/admin/user.controller";
import { tenantManipulationPermission } from "@/middleware/admin/permission.middleware";
import { Router } from "express";
import { authenticate } from "../middleware/admin/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes below
router.use(authenticate);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

// Img Management Routes
router.get("/img/upload-token", tenantManipulationPermission, getImgUploadToken);

export default router;
