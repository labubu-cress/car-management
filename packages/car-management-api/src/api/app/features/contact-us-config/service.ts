import type { ContactUsConfig as PrismaContactUsConfig } from "@prisma/client";
import { prisma as db } from "../../../../lib/db";
import type { ContactUsConfig } from "./types";

const transformContactUsConfig = (config: PrismaContactUsConfig): ContactUsConfig => {
  const { workdays, workStartTime, workEndTime, ...rest } = config;

  let isServiceTime = true; // default to true if not configured

  const workdaysArray = workdays as number[] | null;

  if (workdaysArray && Array.isArray(workdaysArray) && workStartTime != null && workEndTime != null) {
    const now = new Date();
    const currentDay = now.getDay(); // Sunday is 0, Monday is 1, etc.
    const currentHour = now.getHours();

    if (workdaysArray.includes(currentDay) && currentHour >= workStartTime && currentHour < workEndTime) {
      isServiceTime = true;
    } else {
      isServiceTime = false;
    }
  }

  return {
    ...rest,
    workdays: workdaysArray,
    workStartTime,
    workEndTime,
    isServiceTime,
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
