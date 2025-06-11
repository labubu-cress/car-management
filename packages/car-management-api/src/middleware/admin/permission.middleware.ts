import type { OmitPasswordHash } from "@/types/typeHelper";
import type { AdminUser } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { tenantIdFromRequest } from "../../utils/tenant-id";

const hasTenantManipulationPermission = (user: OmitPasswordHash<AdminUser>, tenantId: string): boolean => {
  switch (user.role) {
    case "super_admin":
    case "admin":
      return true;
    case "tenant_admin":
      return tenantId === user.tenantId;
    case "tenant_viewer":
      return false;
    default:
      return false;
  }
};

export const tenantManipulationPermission = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = tenantIdFromRequest(req);
  if (!hasTenantManipulationPermission(req.user!, tenantId)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};

export const superAdminPermission = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
