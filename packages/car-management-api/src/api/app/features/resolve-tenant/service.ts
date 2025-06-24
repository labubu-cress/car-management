import { prisma } from "@/lib/db";
import { HTTPException } from "hono/http-exception";

export class AppService {
  async resolveTenant(appId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { appId: appId },
      select: { id: true },
    });

    if (!tenant) {
      throw new HTTPException(404, { message: "Tenant not found" });
    }

    return { tenantId: tenant.id };
  }
}
