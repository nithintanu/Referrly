import { Request, Response } from "express";
import { referralService } from "../services/referralService";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  AppError,
  getResumePublicPath,
  requireString,
  sendResponse,
} from "../utils/helpers";

export const referralController = {
  createRequest: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const request = await referralService.createRequest({
      seekerId: userId,
      referrerId: requireString(req.body.referrerId, "Referrer"),
      company: requireString(req.body.company, "Company"),
      jobRole: requireString(req.body.jobRole, "Job role"),
      jobDescription: requireString(req.body.jobDescription, "Job description"),
      message: req.body.message,
      resumeUrl: req.file ? getResumePublicPath(req.file.filename) : req.body.resumeUrl,
    });

    return sendResponse(res, 201, "Referral request created", request);
  }),

  getMyRequests: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const requests = await referralService.getRequestsBySeeker(
      userId,
      typeof req.query.status === "string" ? req.query.status : undefined
    );

    return sendResponse(res, 200, "Referral requests retrieved", requests);
  }),

  getIncomingRequests: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const requests = await referralService.getRequestsByReferrer(
      userId,
      typeof req.query.status === "string" ? req.query.status : undefined
    );

    return sendResponse(res, 200, "Incoming requests retrieved", requests);
  }),

  updateRequestStatus: asyncHandler(async (req: Request, res: Response) => {
    const actor = req.authUser;

    if (!actor) {
      throw new AppError(401, "Unauthorized");
    }

    const request = await referralService.updateRequestStatus(
      requireString(req.params.id, "Request ID"),
      requireString(req.body.status, "Status"),
      actor.userId,
      actor.role
    );

    return sendResponse(res, 200, "Request status updated", request);
  }),

  submitReview: asyncHandler(async (req: Request, res: Response) => {
    const actor = req.authUser;

    if (!actor) {
      throw new AppError(401, "Unauthorized");
    }

    const review = await referralService.submitReview(
      requireString(req.params.id, "Request ID"),
      actor.userId,
      Number(req.body.rating),
      typeof req.body.comment === "string" ? req.body.comment : undefined
    );

    return sendResponse(res, 201, "Review submitted", review);
  }),

  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const notifications = await referralService.getNotifications(userId);
    return sendResponse(res, 200, "Notifications retrieved", notifications);
  }),

  markNotificationAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const notification = await referralService.markNotificationAsRead(
      requireString(req.params.id, "Notification ID"),
      userId
    );

    return sendResponse(res, 200, "Notification marked as read", notification);
  }),

  searchReferrers: asyncHandler(async (req: Request, res: Response) => {
    const referrers = await referralService.searchReferrers({
      company: typeof req.query.company === "string" ? req.query.company : undefined,
      skills: typeof req.query.skills === "string" ? req.query.skills : undefined,
      query: typeof req.query.query === "string" ? req.query.query : undefined,
    });

    return sendResponse(res, 200, "Referrers retrieved", referrers);
  }),

  getReferrerById: asyncHandler(async (req: Request, res: Response) => {
    const referrer = await referralService.getReferrerById(requireString(req.params.id, "Referrer ID"));
    return sendResponse(res, 200, "Referrer retrieved", referrer);
  }),

  getDashboardData: asyncHandler(async (req: Request, res: Response) => {
    const actor = req.authUser;

    if (!actor) {
      throw new AppError(401, "Unauthorized");
    }

    const dashboard = await referralService.getDashboardData(actor.userId, actor.role);
    return sendResponse(res, 200, "Dashboard data retrieved", dashboard);
  }),

  getRewardsOverview: asyncHandler(async (req: Request, res: Response) => {
    const actor = req.authUser;

    if (!actor) {
      throw new AppError(401, "Unauthorized");
    }

    const rewards = await referralService.getRewardsOverview(actor.userId, actor.role);
    return sendResponse(res, 200, "Rewards overview retrieved", rewards);
  }),

  redeemReward: asyncHandler(async (req: Request, res: Response) => {
    const actor = req.authUser;

    if (!actor) {
      throw new AppError(401, "Unauthorized");
    }

    const redemption = await referralService.redeemReward(
      actor.userId,
      requireString(req.params.id, "Reward ID"),
      actor.role
    );

    return sendResponse(res, 201, "Reward redemption created", redemption);
  }),
};
