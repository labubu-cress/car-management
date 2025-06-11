import type { Request, Response } from "express";
import * as userService from "../../services/admin/user.service";
import { tenantIdFromRequest } from "../../utils/tenant-id";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const users = await userService.getAllUsers(tenantId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { id } = req.params;
    const user = await userService.getUserById(tenantId, id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};
