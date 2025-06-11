import type { OmitPasswordHash } from "@/types/typeHelper";
import type { AdminUser } from "@prisma/client";
import type { Request, Response } from "express";
import * as adminUserService from "../../services/admin-user.service";

export const hasAdminManipulationPermission = (
  user: OmitPasswordHash<AdminUser>,
  targetUser: OmitPasswordHash<AdminUser>,
): boolean => {
  switch (user.role) {
    case "super_admin":
      return true;
    case "admin":
      return targetUser.role !== "super_admin";
    case "tenant_admin":
      return targetUser.role !== "super_admin" && targetUser.role !== "admin" && targetUser.tenantId === user.tenantId;
    case "tenant_viewer":
      return false;
    default:
      return false;
  }
};

// GET /api/v1/admin/users
export const getAllAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = (await adminUserService.getAllAdminUsers()).filter((user) =>
      hasAdminManipulationPermission(req.adminUser!, user),
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin users" });
  }
};

// GET /api/v1/admin/users/:id
export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await adminUserService.getAdminUserById(id);
    if (hasAdminManipulationPermission(req.adminUser!, user!)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "Admin user not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin user" });
  }
};

// POST /api/v1/admin/users
export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { adminUser } = req;
    if (!hasAdminManipulationPermission(adminUser!, req.body)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const newUser = await adminUserService.createAdminUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin user" });
  }
};

// PUT /api/v1/admin/users/:id
export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminUser } = req;
    if (!hasAdminManipulationPermission(adminUser!, req.body)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const updatedUser = await adminUserService.updateAdminUser(id, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "Admin user not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating admin user" });
  }
};

// DELETE /api/v1/admin/users/:id
export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminUser } = req;
    if (!hasAdminManipulationPermission(adminUser!, req.body)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    await adminUserService.deleteAdminUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin user" });
  }
};
