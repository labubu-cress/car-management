import type { OmitPasswordHash } from "@/types/typeHelper";
import type { AdminUser } from "@prisma/client";
import type { Request, Response } from "express";
import * as tenantService from "../../services/tenant.service";

const hasTenantViewPermission = (user: OmitPasswordHash<AdminUser>, tenantId: string): boolean => {
  switch (user.role) {
    case "super_admin":
    case "admin":
      return true;
    case "tenant_admin":
    case "tenant_viewer":
      return tenantId === user.tenantId;
    default:
      return false;
  }
};

// GET /api/v1/admin/tenants
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = (await tenantService.getAllTenants()).filter((tenant) =>
      hasTenantViewPermission(req.adminUser!, tenant.id),
    );
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenants" });
  }
};

// GET /api/v1/admin/tenants/:id
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!hasTenantViewPermission(req.adminUser!, id)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const tenant = await tenantService.getTenantById(id);
    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenant" });
  }
};

// POST /api/v1/admin/tenants
export const createTenant = async (req: Request, res: Response) => {
  try {
    const newTenant = await tenantService.createTenant(req.body);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ message: "Error creating tenant" });
  }
};

// PUT /api/v1/admin/tenants/:id
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTenant = await tenantService.updateTenant(id, req.body);
    if (updatedTenant) {
      res.json(updatedTenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating tenant" });
  }
};

// DELETE /api/v1/admin/tenants/:id
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tenantService.deleteTenant(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting tenant" });
  }
};
