import { createQcloudImgUploadToken } from "@/cloud/qcloudCos";
import { tenantIdFromRequest } from "@/utils/tenant-id";
import type { Request, Response } from "express";

export const getImgUploadToken = async (req: Request, res: Response) => {
  const tenantId = tenantIdFromRequest(req);
  try {
    const configWithToken = await createQcloudImgUploadToken(tenantId);
    res.json(configWithToken);
  } catch (e) {
    console.log(e);
    res.status(500).send("Failed to get upload token");
  }
};
