export type Role = "SEEKER" | "REFERRER" | "ADMIN";
export type RequestStatus = "REQUESTED" | "ACCEPTED" | "REFERRED" | "REJECTED";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  profilePhoto?: string | null;
  resumeUrl?: string | null;
  resumeScore?: number;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferrerStats {
  credibilityScore: number;
  responseRate: number;
  acceptanceRate: number;
  averageRating: number;
  totalReviews: number;
  totalRequestsReceived: number;
  pendingRequests: number;
  acceptedRequests: number;
  referredRequests: number;
  rejectedRequests: number;
  referallyCoins: number;
  badges: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company?: string | null;
  skills: string[];
  experience?: number | null;
  referallyCoins: number;
  createdAt: string;
  updatedAt: string;
  profile?: Profile | null;
  referrerStats?: ReferrerStats | null;
}

export interface Review {
  id: string;
  requestId: string;
  reviewerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer: User;
}

export interface ReferralRequest {
  id: string;
  seekerId: string;
  referrerId: string;
  company: string;
  jobRole: string;
  jobDescription: string;
  message?: string | null;
  resumeUrl?: string | null;
  status: RequestStatus;
  outcome?: "SELECTED" | "NOT_SELECTED" | null;
  seeker: User;
  referrer: User;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  requestId?: string | null;
  type:
    | "REQUEST_RECEIVED"
    | "REQUEST_ACCEPTED"
    | "REQUEST_REJECTED"
    | "REQUEST_REFERRED"
    | "REQUEST_OUTCOME_UPDATED"
    | "COINS_AWARDED"
    | "REWARD_REDEEMED"
    | "REVIEW_RECEIVED";
  message: string;
  read: boolean;
  createdAt: string;
  request?: ReferralRequest | null;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "SEEKER" | "REFERRER">;
  company?: string;
  skills?: string[];
  experience?: number | null;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  company?: string;
  skills?: string[];
  experience?: number | null;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface ReferrerSearchParams {
  query?: string;
  company?: string;
  skills?: string;
}

export interface RequestStats {
  totalRequests: number;
  requestedRequests: number;
  acceptedRequests: number;
  referredRequests: number;
  rejectedRequests: number;
}

export interface AdminStats {
  usersCount: number;
  requestsCount: number;
  notificationsCount: number;
  rewardsCount: number;
  redemptionsCount: number;
}

export type RewardCategory = "GIFT_CARD" | "GOODIES" | "LEARNING" | "COMMUNITY";
export type RedemptionStatus = "PROCESSING" | "FULFILLED" | "CANCELLED";
export type CoinTransactionType =
  | "REQUEST_ACCEPTED_BONUS"
  | "REFERRAL_COMPLETED_BONUS"
  | "REVIEW_RECEIVED_BONUS"
  | "REWARD_REDEMPTION";

export interface RewardItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: RewardCategory;
  coinCost: number;
  stock?: number | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardItemId: string;
  coinsSpent: number;
  status: RedemptionStatus;
  createdAt: string;
  updatedAt: string;
  rewardItem: RewardItem;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: CoinTransactionType;
  amount: number;
  balanceAfter: number;
  reason: string;
  requestId?: string | null;
  redemptionId?: string | null;
  createdAt: string;
  request?: ReferralRequest | null;
  redemption?: {
    id: string;
    status: RedemptionStatus;
    coinsSpent: number;
    rewardItem: RewardItem;
  } | null;
}

export interface RewardsOverview {
  coinsBalance: number;
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  coinTransactions: CoinTransaction[];
  referrerInsights?: ReferrerStats | null;
}

export interface DashboardData {
  role: Role;
  unreadNotifications: number;
  stats: RequestStats | AdminStats;
  recentRequests: ReferralRequest[];
  recentUsers?: User[];
  referrerInsights?: ReferrerStats | null;
  roleBreakdown?: {
    seekers: number;
    referrers: number;
    admins: number;
  };
  statusBreakdown?: {
    requested: number;
    accepted: number;
    referred: number;
    rejected: number;
  };
}
