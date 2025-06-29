import type { ContactUsConfig as PrismaContactUsConfig } from "@prisma/client";
import { prisma as db } from "../../../../lib/db";
import type { ContactUsConfig } from "./types";

const transformContactUsConfig = (config: PrismaContactUsConfig): ContactUsConfig => {
  const { workdays, workStartTime, workEndTime, ...rest } = config;

  const workdaysArray = workdays as number[] | null;

  return {
    ...rest,
    workdays: workdaysArray,
    workStartTime,
    workEndTime,
  };
};

export async function getContactUsConfig(tenantId: string): Promise<ContactUsConfig | null> {
  const config = await db.contactUsConfig.findUnique({
    where: { tenantId },
  });

  if (!config) {
    return null;
  }

  return transformContactUsConfig(config);
}
