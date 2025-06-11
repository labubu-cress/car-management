import type { AdminUser } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import * as authService from "../../services/admin/auth.service";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: AdminUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const user = await authService.verify(token);
      if (user) {
        req.user = user;
        next();
      } else {
        res.sendStatus(401); // Unauthorized
      }
    } catch (error) {
      res.sendStatus(401); // Unauthorized
    }
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
