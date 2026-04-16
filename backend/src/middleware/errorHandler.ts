import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError, sendError } from "../utils/helpers";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  if (err instanceof multer.MulterError) {
    return sendError(res, 400, err.message);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, "A record with the same unique value already exists");
    }

    return sendError(res, 400, "Database request failed");
  }

  if (err instanceof Error) {
    return sendError(res, 500, err.message || "Internal server error");
  }

  return sendError(res, 500, "Internal server error");
};
