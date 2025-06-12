import { tenantIdFromRequest } from "@/utils/tenant-id";
import type { Request, Response } from "express";
import * as imgService from "../../services/admin/img.service";

export const getImgUploadToken = async (req: Request, res: Response) => {
  const tenantId = tenantIdFromRequest(req);
  try {
    const configWithToken = await imgService.createImgUploadToken(tenantId);
    res.json(configWithToken);
  } catch (e) {
    console.log(e);
    res.status(500).send("Failed to get upload token");
  }
};
