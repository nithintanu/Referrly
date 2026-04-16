import jwt, { SignOptions } from "jsonwebtoken";
import {
  CoinTransactionType,
  Prisma,
  RequestStatus,
  RewardCategory,
  RedemptionStatus,
  Role,
} from "@prisma/client";
import { Response } from "express";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const publicProfileSelect = Prisma.validator<Prisma.ProfileSelect>()({
  id: true,
  userId: true,
  bio: true,
  profilePhoto: true,
  resumeUrl: true,
  resumeScore: true,
  linkedinUrl: true,
  portfolioUrl: true,
  createdAt: true,
  updatedAt: true,
});

export const publicUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  role: true,
  company: true,
  skills: true,
  experience: true,
  referallyCoins: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: publicProfileSelect,
  },
});

export const referralRequestInclude = Prisma.validator<Prisma.ReferralRequestInclude>()({
  seeker: {
    select: publicUserSelect,
  },
  referrer: {
    select: publicUserSelect,
  },
  reviews: {
    include: {
      reviewer: {
        select: publicUserSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
});

interface JWTPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export const REQUEST_STATUSES: RequestStatus[] = ["REQUESTED", "ACCEPTED", "REFERRED", "REJECTED"];
export const USER_ROLES: Role[] = ["SEEKER", "REFERRER", "ADMIN"];
export const REWARD_CATEGORIES: RewardCategory[] = ["GIFT_CARD", "GOODIES", "LEARNING", "COMMUNITY"];
export const REDEMPTION_STATUSES: RedemptionStatus[] = ["PROCESSING", "FULFILLED", "CANCELLED"];

export const COIN_REWARD_VALUES: Record<CoinTransactionType, number> = {
  REQUEST_ACCEPTED_BONUS: 20,
  REFERRAL_COMPLETED_BONUS: 30,
  REVIEW_RECEIVED_BONUS: 20,
  REWARD_REDEMPTION: 0,
};

export const generateToken = (userId: string, role: Role): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(500, "JWT_SECRET is not configured");
  }

  const payload: JWTPayload = { userId, role };

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRY || "7d") as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(500, "JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as JWTPayload;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const normalizeOptionalString = (value?: string | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const parseSkills = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((skill) => String(skill).trim())
      .filter(Boolean)
      .filter((skill, index, list) => list.indexOf(skill) === index);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseSkills(parsed);
      } catch {
        return [];
      }
    }

    return trimmed
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .filter((skill, index, list) => list.indexOf(skill) === index);
  }

  return [];
};

export const serializeSkills = (skills: string[]) => JSON.stringify(skills);

export const parseStoredSkills = (skills?: string | null) => {
  if (!skills) {
    return [];
  }

  return parseSkills(skills);
};

type PublicUserWithProfile = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export const sanitizeUser = (user: PublicUserWithProfile) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  company: user.company,
  skills: parseStoredSkills(user.skills),
  experience: user.experience,
  referallyCoins: user.referallyCoins,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  profile: user.profile
    ? {
        id: user.profile.id,
        userId: user.profile.userId,
        bio: user.profile.bio,
        profilePhoto: user.profile.profilePhoto,
        resumeUrl: user.profile.resumeUrl,
        resumeScore: user.profile.resumeScore,
        linkedinUrl: user.profile.linkedinUrl,
        portfolioUrl: user.profile.portfolioUrl,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
      }
    : null,
});

type ReferralRequestWithUsers = Prisma.ReferralRequestGetPayload<{
  include: typeof referralRequestInclude;
}>;

type ReviewWithReviewer = Prisma.ReviewGetPayload<{
  include: {
    reviewer: {
      select: typeof publicUserSelect;
    };
  };
}>;

export const serializeReview = (review: ReviewWithReviewer) => ({
  id: review.id,
  requestId: review.requestId,
  reviewerId: review.reviewerId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  reviewer: sanitizeUser(review.reviewer),
});

export const serializeReferralRequest = (request: ReferralRequestWithUsers) => ({
  id: request.id,
  seekerId: request.seekerId,
  referrerId: request.referrerId,
  company: request.company,
  jobRole: request.jobRole,
  jobDescription: request.jobDescription,
  message: request.message,
  resumeUrl: request.resumeUrl,
  status: request.status,
  outcome: request.outcome,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
  seeker: sanitizeUser(request.seeker),
  referrer: sanitizeUser(request.referrer),
  reviews: request.reviews.map(serializeReview),
});

type NotificationWithRequest = Prisma.NotificationGetPayload<{
  include: {
    request: {
      include: typeof referralRequestInclude;
    };
  };
}>;

export const serializeNotification = (notification: NotificationWithRequest) => ({
  id: notification.id,
  userId: notification.userId,
  requestId: notification.requestId,
  type: notification.type,
  message: notification.message,
  read: notification.read,
  createdAt: notification.createdAt,
  request: notification.request ? serializeReferralRequest(notification.request) : null,
});

export const ensureValidRole = (role: string, allowedRoles: Role[] = USER_ROLES): Role => {
  if (!allowedRoles.includes(role as Role)) {
    throw new AppError(400, `Invalid role. Expected one of: ${allowedRoles.join(", ")}`);
  }

  return role as Role;
};

export const ensureValidStatus = (status: string): RequestStatus => {
  if (!REQUEST_STATUSES.includes(status as RequestStatus)) {
    throw new AppError(
      400,
      `Invalid status. Expected one of: ${REQUEST_STATUSES.join(", ")}`
    );
  }

  return status as RequestStatus;
};

export const ensureValidRewardCategory = (category: string): RewardCategory => {
  if (!REWARD_CATEGORIES.includes(category as RewardCategory)) {
    throw new AppError(
      400,
      `Invalid reward category. Expected one of: ${REWARD_CATEGORIES.join(", ")}`
    );
  }

  return category as RewardCategory;
};

export const ensureValidRedemptionStatus = (status: string): RedemptionStatus => {
  if (!REDEMPTION_STATUSES.includes(status as RedemptionStatus)) {
    throw new AppError(
      400,
      `Invalid redemption status. Expected one of: ${REDEMPTION_STATUSES.join(", ")}`
    );
  }

  return status as RedemptionStatus;
};

export const requireString = (value: unknown, fieldName: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${fieldName} is required`);
  }

  return value.trim();
};

export const getResumePublicPath = (filename: string) => `/uploads/resumes/${filename}`;

export interface ReferrerMetricsInput {
  totalRequests: number;
  acceptedRequests: number;
  referredRequests: number;
  rejectedRequests: number;
  averageRating: number;
  totalReviews: number;
}

export const calculateReferrerCredibility = ({
  totalRequests,
  acceptedRequests,
  referredRequests,
  rejectedRequests,
  averageRating,
  totalReviews,
}: ReferrerMetricsInput) => {
  if (!totalRequests) {
    return 0;
  }

  const responseRate = Math.min(1, (acceptedRequests + rejectedRequests + referredRequests) / totalRequests);
  const completionRate = Math.min(1, referredRequests / totalRequests);
  const acceptanceRate = Math.min(1, (acceptedRequests + referredRequests) / totalRequests);
  const ratingScore = totalReviews ? averageRating / 5 : 0.65;

  const score = (responseRate * 25 + completionRate * 35 + acceptanceRate * 15 + ratingScore * 25) * 100;
  return Math.round(score / 100);
};

export const getReferrerBadges = ({
  credibilityScore,
  referredRequests,
  averageRating,
  totalReviews,
  responseRate,
}: {
  credibilityScore: number;
  referredRequests: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}) => {
  const badges: string[] = [];

  if (credibilityScore >= 85) {
    badges.push("Trusted Referrer");
  }

  if (referredRequests >= 5) {
    badges.push("Referral Closer");
  }

  if (responseRate >= 0.85) {
    badges.push("Fast Responder");
  }

  if (totalReviews >= 3 && averageRating >= 4.5) {
    badges.push("Community Favorite");
  }

  if (!badges.length) {
    badges.push("Rising Mentor");
  }

  return badges;
};

type RewardItemRecord = Prisma.RewardItemGetPayload<object>;

export const serializeRewardItem = (reward: RewardItemRecord) => ({
  id: reward.id,
  name: reward.name,
  slug: reward.slug,
  description: reward.description,
  category: reward.category,
  coinCost: reward.coinCost,
  stock: reward.stock,
  imageUrl: reward.imageUrl,
  active: reward.active,
  createdAt: reward.createdAt,
  updatedAt: reward.updatedAt,
});

type CoinTransactionRecord = Prisma.CoinTransactionGetPayload<{
  include: {
    request: {
      include: typeof referralRequestInclude;
    };
    redemption: {
      include: {
        rewardItem: true;
      };
    };
  };
}>;

export const serializeCoinTransaction = (transaction: CoinTransactionRecord) => ({
  id: transaction.id,
  userId: transaction.userId,
  type: transaction.type,
  amount: transaction.amount,
  balanceAfter: transaction.balanceAfter,
  reason: transaction.reason,
  requestId: transaction.requestId,
  redemptionId: transaction.redemptionId,
  createdAt: transaction.createdAt,
  request: transaction.request ? serializeReferralRequest(transaction.request) : null,
  redemption: transaction.redemption
    ? {
        id: transaction.redemption.id,
        status: transaction.redemption.status,
        coinsSpent: transaction.redemption.coinsSpent,
        rewardItem: serializeRewardItem(transaction.redemption.rewardItem),
      }
    : null,
});

type RewardRedemptionRecord = Prisma.RewardRedemptionGetPayload<{
  include: {
    rewardItem: true;
  };
}>;

export const serializeRewardRedemption = (redemption: RewardRedemptionRecord) => ({
  id: redemption.id,
  userId: redemption.userId,
  rewardItemId: redemption.rewardItemId,
  coinsSpent: redemption.coinsSpent,
  status: redemption.status,
  createdAt: redemption.createdAt,
  updatedAt: redemption.updatedAt,
  rewardItem: serializeRewardItem(redemption.rewardItem),
});
