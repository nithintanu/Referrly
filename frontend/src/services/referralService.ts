import api, { extractData } from "../utils/api";
import {
  ApiResponse,
  DashboardData,
  Notification,
  ReferralRequest,
  ReferrerSearchParams,
  Review,
  RewardRedemption,
  RewardsOverview,
  RequestStatus,
  User,
} from "../types";

export const referralService = {
  createRequest: async (data: FormData) =>
    extractData(
      await api.post<ApiResponse<ReferralRequest>>("/requests", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  getMyRequests: async (status?: RequestStatus | "ALL") =>
    extractData(
      await api.get<ApiResponse<ReferralRequest[]>>("/requests/mine", {
        params: status && status !== "ALL" ? { status } : undefined,
      })
    ),

  getIncomingRequests: async (status?: RequestStatus | "ALL") =>
    extractData(
      await api.get<ApiResponse<ReferralRequest[]>>("/requests/incoming", {
        params: status && status !== "ALL" ? { status } : undefined,
      })
    ),

  updateRequestStatus: async (requestId: string, status: Exclude<RequestStatus, "REQUESTED">) =>
    extractData(
      await api.patch<ApiResponse<ReferralRequest>>(`/requests/${requestId}/status`, { status })
    ),

  submitReview: async (requestId: string, payload: { rating: number; comment?: string }) =>
    extractData(
      await api.post<ApiResponse<Review>>(`/requests/${requestId}/reviews`, payload, {
        headers: { "Content-Type": "application/json" },
      })
    ),

  getNotifications: async () =>
    extractData(await api.get<ApiResponse<Notification[]>>("/notifications")),

  markNotificationAsRead: async (notificationId: string) =>
    extractData(await api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`)),

  searchReferrers: async (params: ReferrerSearchParams) =>
    extractData(await api.get<ApiResponse<User[]>>("/referrers", { params })),

  getReferrerById: async (referrerId: string) =>
    extractData(await api.get<ApiResponse<User>>(`/referrers/${referrerId}`)),

  getDashboardData: async () =>
    extractData(await api.get<ApiResponse<DashboardData>>("/dashboard")),

  getRewardsOverview: async () =>
    extractData(await api.get<ApiResponse<RewardsOverview>>("/rewards")),

  redeemReward: async (rewardId: string) =>
    extractData(await api.post<ApiResponse<RewardRedemption>>(`/rewards/${rewardId}/redeem`)),
};
