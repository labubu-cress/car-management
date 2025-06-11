import type { Request } from "express";

export const tenantIdFromRequest = (req: Request): string => {
  if (req.user && req.user.tenantId) {
    return req.user.tenantId;
  }

  // For super_admin, tenantId might be in the body for creation operations
  if (req.body.tenantId) {
    return req.body.tenantId;
  }

  // For super_admin, tenantId might be in the query for list operations
  if (req.query.tenantId && typeof req.query.tenantId === "string") {
    return req.query.tenantId;
  }

  throw new Error("Tenant ID could not be determined from the request.");
};
