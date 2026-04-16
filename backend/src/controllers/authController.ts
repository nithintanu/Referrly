import { Request, Response } from "express";
import { authService } from "../services/authService";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError, requireString, sendResponse } from "../utils/helpers";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register({
      email: requireString(req.body.email, "Email"),
      password: requireString(req.body.password, "Password"),
      name: requireString(req.body.name, "Name"),
      role: req.body.role,
    });

    return sendResponse(res, 201, "User registered successfully", result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(
      requireString(req.body.email, "Email"),
      requireString(req.body.password, "Password")
    );

    return sendResponse(res, 200, "Login successful", result);
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const user = await authService.getUserProfile(userId);
    return sendResponse(res, 200, "Profile retrieved", user);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const updatedUser = await authService.updateProfile(userId, req.body);
    return sendResponse(res, 200, "Profile updated", updatedUser);
  }),
};
