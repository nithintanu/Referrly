import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { sendError, verifyToken } from "../utils/helpers";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Authentication token is required");
  }

  try {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    req.authUser = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch {
    return sendError(res, 401, "Invalid or expired token");
  }
};

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser || !allowedRoles.includes(req.authUser.role)) {
      return sendError(res, 403, "Access denied");
    }

    return next();
  };
};
