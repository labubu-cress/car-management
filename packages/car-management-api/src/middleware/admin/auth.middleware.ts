import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, AdminUser } from '@prisma/client';

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

interface JwtPayload {
  id: string;
}

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: AdminUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      const user = await prisma.adminUser.findUnique({ where: { id: payload.id } });

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