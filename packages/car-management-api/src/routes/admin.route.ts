import { getImgUploadToken } from "@/controllers/admin/img.controller";
import {
  createTenant,
  deleteTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
} from "@/controllers/admin/tenant.controller";
import { getAllUsers, getUserById } from "@/controllers/admin/user.controller";
import { superAdminPermission, tenantManipulationPermission } from "@/middleware/admin/permission.middleware";
import { Router } from "express";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAllAdminUsers,
  getCurrentAdminUser,
  updateAdminUser,
} from "../controllers/admin/admin-user.controller";
import { login } from "../controllers/admin/auth.controller";
import { authenticate } from "../middleware/admin/auth.middleware";

const router = Router();

// Auth Routes
// POST /api/admin/auth/login - Admin user login
router.post("/auth/login", login);

// Apply authentication middleware to all routes below
router.use(authenticate);

// Tenant Management Routes
router.post("/tenants", superAdminPermission, createTenant);
router.get("/tenants", getAllTenants);
router.get("/tenants/:id", getTenantById);
router.put("/tenants/:id", superAdminPermission, tenantManipulationPermission, updateTenant);
router.delete("/tenants/:id", superAdminPermission, tenantManipulationPermission, deleteTenant);

// AdminUser Management Routes
router.get("/admin-users/current", getCurrentAdminUser);
router.post("/admin-users", createAdminUser);
router.get("/admin-users", getAllAdminUsers);
router.get("/admin-users/:id", getAdminUserById);
router.put("/admin-users/:id", updateAdminUser);
router.delete("/admin-users/:id", deleteAdminUser);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

// Img Management Routes
router.get("/img/upload-token", tenantManipulationPermission, getImgUploadToken);

export default router;
