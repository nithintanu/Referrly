import { Router } from "express";
import { referralController } from "../controllers/referralController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";
import { resumeUpload } from "../middleware/upload";

const router = Router();

router.post(
  "/requests",
  authMiddleware,
  roleMiddleware(["SEEKER"]),
  resumeUpload.single("resume"),
  referralController.createRequest
);
router.get("/requests/mine", authMiddleware, roleMiddleware(["SEEKER"]), referralController.getMyRequests);
router.get(
  "/requests/incoming",
  authMiddleware,
  roleMiddleware(["REFERRER", "ADMIN"]),
  referralController.getIncomingRequests
);
router.patch(
  "/requests/:id/status",
  authMiddleware,
  roleMiddleware(["REFERRER", "ADMIN"]),
  referralController.updateRequestStatus
);
router.post(
  "/requests/:id/reviews",
  authMiddleware,
  roleMiddleware(["SEEKER", "ADMIN"]),
  referralController.submitReview
);
router.get("/notifications", authMiddleware, referralController.getNotifications);
router.patch("/notifications/:id/read", authMiddleware, referralController.markNotificationAsRead);
router.get("/referrers", authMiddleware, referralController.searchReferrers);
router.get("/referrers/:id", authMiddleware, referralController.getReferrerById);
router.get("/dashboard", authMiddleware, referralController.getDashboardData);
router.get("/rewards", authMiddleware, roleMiddleware(["REFERRER", "ADMIN"]), referralController.getRewardsOverview);
router.post(
  "/rewards/:id/redeem",
  authMiddleware,
  roleMiddleware(["REFERRER", "ADMIN"]),
  referralController.redeemReward
);

export default router;
