import type { ContactUsConfig } from "@prisma/client";
import crypto from "crypto";

export const password2hash = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

// 验证密码
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
};

export const transformContactUsConfig = (config: ContactUsConfig) => {
  const { workdays, workStartTime, workEndTime } = config;

  let isServiceTime = true; // default to true if not configured

  if (workdays && Array.isArray(workdays) && workStartTime != null && workEndTime != null) {
    const now = new Date();
    const currentDay = now.getDay(); // Sunday is 0, Monday is 1, etc.
    const currentHour = now.getHours();

    if (workdays.includes(currentDay) && currentHour >= workStartTime && currentHour < workEndTime) {
      isServiceTime = true;
    } else {
      isServiceTime = false;
    }
  }

  return {
    ...config,
    isServiceTime,
  };
};
