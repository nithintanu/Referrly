import {
  CoinTransactionType,
  NotificationType,
  Prisma,
  RequestStatus,
  Role,
} from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  AppError,
  COIN_REWARD_VALUES,
  calculateReferrerCredibility,
  ensureValidStatus,
  getReferrerBadges,
  normalizeOptionalString,
  parseSkills,
  publicUserSelect,
  referralRequestInclude,
  sanitizeUser,
  serializeCoinTransaction,
  serializeNotification,
  serializeReferralRequest,
  serializeReview,
  serializeRewardRedemption,
  serializeRewardItem,
} from "../utils/helpers";

interface CreateRequestInput {
  seekerId: string;
  referrerId: string;
  company: string;
  jobRole: string;
  jobDescription: string;
  message?: string;
  resumeUrl?: string | null;
}

interface SearchReferrersInput {
  company?: string;
  skills?: string;
  query?: string;
}

const notificationForStatus: Record<
  Exclude<RequestStatus, "REQUESTED">,
  { type: NotificationType; message: (company: string, role: string) => string }
> = {
  ACCEPTED: {
    type: "REQUEST_ACCEPTED",
    message: (company, role) =>
      `Your referral request for ${role} at ${company} has been accepted.`,
  },
  REFERRED: {
    type: "REQUEST_REFERRED",
    message: (company, role) =>
      `Your referral request for ${role} at ${company} has been marked as referred.`,
  },
  REJECTED: {
    type: "REQUEST_REJECTED",
    message: (company, role) =>
      `Your referral request for ${role} at ${company} has been rejected.`,
  },
};

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  REQUESTED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["REFERRED", "REJECTED"],
  REFERRED: [],
  REJECTED: [],
};

const getStatusCounts = async (where: Prisma.ReferralRequestWhereInput) => {
  const [totalRequests, requestedRequests, acceptedRequests, referredRequests, rejectedRequests] =
    await Promise.all([
      prisma.referralRequest.count({ where }),
      prisma.referralRequest.count({ where: { ...where, status: "REQUESTED" } }),
      prisma.referralRequest.count({ where: { ...where, status: "ACCEPTED" } }),
      prisma.referralRequest.count({ where: { ...where, status: "REFERRED" } }),
      prisma.referralRequest.count({ where: { ...where, status: "REJECTED" } }),
    ]);

  return {
    totalRequests,
    requestedRequests,
    acceptedRequests,
    referredRequests,
    rejectedRequests,
  };
};

const buildReferrerInsights = async (userId: string, referallyCoins = 0) => {
  const [stats, reviewAggregate] = await Promise.all([
    getStatusCounts({ referrerId: userId }),
    prisma.review.aggregate({
      where: {
        request: {
          referrerId: userId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const averageRating = Number(reviewAggregate._avg.rating || 0);
  const totalReviews = reviewAggregate._count._all;
  const responseRate = stats.totalRequests
    ? (stats.acceptedRequests + stats.referredRequests + stats.rejectedRequests) / stats.totalRequests
    : 0;
  const acceptanceRate = stats.totalRequests
    ? (stats.acceptedRequests + stats.referredRequests) / stats.totalRequests
    : 0;
  const credibilityScore = calculateReferrerCredibility({
    totalRequests: stats.totalRequests,
    acceptedRequests: stats.acceptedRequests,
    referredRequests: stats.referredRequests,
    rejectedRequests: stats.rejectedRequests,
    averageRating,
    totalReviews,
  });

  return {
    credibilityScore,
    responseRate: Math.round(responseRate * 100),
    acceptanceRate: Math.round(acceptanceRate * 100),
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
    totalRequestsReceived: stats.totalRequests,
    pendingRequests: stats.requestedRequests,
    acceptedRequests: stats.acceptedRequests,
    referredRequests: stats.referredRequests,
    rejectedRequests: stats.rejectedRequests,
    referallyCoins,
    badges: getReferrerBadges({
      credibilityScore,
      referredRequests: stats.referredRequests,
      averageRating,
      totalReviews,
      responseRate,
    }),
  };
};

const attachReferrerInsights = async <
  TUser extends ReturnType<typeof sanitizeUser>
>(
  user: TUser
) => ({
  ...user,
  referrerStats: await buildReferrerInsights(user.id, user.referallyCoins || 0),
});

const awardCoins = async (
  tx: Prisma.TransactionClient,
  {
    userId,
    requestId,
    type,
    reason,
  }: {
    userId: string;
    requestId?: string;
    type: Exclude<CoinTransactionType, "REWARD_REDEMPTION">;
    reason: string;
  }
) => {
  const amount = COIN_REWARD_VALUES[type];

  if (!amount) {
    return null;
  }

  const updatedUser = await tx.user.update({
    where: { id: userId },
    data: {
      referallyCoins: {
        increment: amount,
      },
    },
    select: {
      referallyCoins: true,
    },
  });

  await tx.coinTransaction.create({
    data: {
      userId,
      type,
      amount,
      balanceAfter: updatedUser.referallyCoins,
      reason,
      requestId,
    },
  });

  await tx.notification.create({
    data: {
      userId,
      requestId,
      type: "COINS_AWARDED",
      message: `You earned ${amount} Referrly Coins. ${reason}`,
    },
  });
};

export const referralService = {
  async createRequest(data: CreateRequestInput) {
    if (data.seekerId === data.referrerId) {
      throw new AppError(400, "You cannot send a referral request to yourself");
    }

    const referrer = await prisma.user.findFirst({
      where: {
        id: data.referrerId,
        role: "REFERRER",
      },
      select: publicUserSelect,
    });

    if (!referrer) {
      throw new AppError(404, "Referrer not found");
    }

    const duplicateRequest = await prisma.referralRequest.findFirst({
      where: {
        seekerId: data.seekerId,
        referrerId: data.referrerId,
        company: data.company,
        jobRole: data.jobRole,
      },
    });

    if (duplicateRequest) {
      throw new AppError(409, "A request for this role and referrer already exists");
    }

    const request = await prisma.referralRequest.create({
      data: {
        seekerId: data.seekerId,
        referrerId: data.referrerId,
        company: data.company.trim(),
        jobRole: data.jobRole.trim(),
        jobDescription: data.jobDescription.trim(),
        message: normalizeOptionalString(data.message),
        resumeUrl: normalizeOptionalString(data.resumeUrl),
        status: "REQUESTED",
      },
      include: referralRequestInclude,
    });

    await prisma.notification.create({
      data: {
        userId: data.referrerId,
        requestId: request.id,
        type: "REQUEST_RECEIVED",
        message: `${request.seeker.name} sent you a referral request for ${request.jobRole} at ${request.company}.`,
      },
    });

    return serializeReferralRequest(request);
  },

  async getRequestsBySeeker(seekerId: string, status?: string) {
    const filters = {
      seekerId,
      ...(status ? { status: ensureValidStatus(status) } : {}),
    };

    const requests = await prisma.referralRequest.findMany({
      where: filters,
      include: referralRequestInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map(serializeReferralRequest);
  },

  async getRequestsByReferrer(referrerId: string, status?: string) {
    const filters = {
      referrerId,
      ...(status ? { status: ensureValidStatus(status) } : {}),
    };

    const requests = await prisma.referralRequest.findMany({
      where: filters,
      include: referralRequestInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map(serializeReferralRequest);
  },

  async updateRequestStatus(
    requestId: string,
    status: string,
    actorId: string,
    actorRole: Role
  ) {
    const nextStatus = ensureValidStatus(status);
    const existingRequest = await prisma.referralRequest.findUnique({
      where: { id: requestId },
      include: referralRequestInclude,
    });

    if (!existingRequest) {
      throw new AppError(404, "Referral request not found");
    }

    if (actorRole !== "ADMIN" && existingRequest.referrerId !== actorId) {
      throw new AppError(403, "Only the assigned referrer can update this request");
    }

    if (!allowedTransitions[existingRequest.status].includes(nextStatus)) {
      throw new AppError(
        400,
        `Cannot move a request from ${existingRequest.status} to ${nextStatus}`
      );
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.referralRequest.update({
        where: { id: requestId },
        data: {
          status: nextStatus,
        },
        include: referralRequestInclude,
      });

      const statusNotification =
        notificationForStatus[nextStatus as Exclude<RequestStatus, "REQUESTED">];

      await tx.notification.create({
        data: {
          userId: request.seekerId,
          requestId: request.id,
          type: statusNotification.type,
          message: statusNotification.message(request.company, request.jobRole),
        },
      });

      if (nextStatus === "ACCEPTED") {
        await awardCoins(tx, {
          userId: request.referrerId,
          requestId: request.id,
          type: "REQUEST_ACCEPTED_BONUS",
          reason: `You responded positively to a seeker for ${request.jobRole} at ${request.company}.`,
        });
      }

      if (nextStatus === "REFERRED") {
        await awardCoins(tx, {
          userId: request.referrerId,
          requestId: request.id,
          type: "REFERRAL_COMPLETED_BONUS",
          reason: `You marked a referral complete for ${request.jobRole} at ${request.company}.`,
        });
      }

      return request;
    });

    return serializeReferralRequest(updatedRequest);
  },

  async submitReview(
    requestId: string,
    reviewerId: string,
    rating: number,
    comment?: string
  ) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError(400, "Rating must be an integer between 1 and 5");
    }

    const request = await prisma.referralRequest.findUnique({
      where: { id: requestId },
      include: referralRequestInclude,
    });

    if (!request) {
      throw new AppError(404, "Referral request not found");
    }

    if (request.seekerId !== reviewerId) {
      throw new AppError(403, "Only the seeker can review this referral");
    }

    if (request.status !== "REFERRED") {
      throw new AppError(400, "Reviews can only be submitted after a referral is completed");
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        requestId_reviewerId: {
          requestId,
          reviewerId,
        },
      },
    });

    const review = await prisma.$transaction(async (tx) => {
      const savedReview = existingReview
        ? await tx.review.update({
            where: {
              requestId_reviewerId: {
                requestId,
                reviewerId,
              },
            },
            data: {
              rating,
              comment: normalizeOptionalString(comment),
            },
            include: {
              reviewer: {
                select: publicUserSelect,
              },
            },
          })
        : await tx.review.create({
            data: {
              requestId,
              reviewerId,
              rating,
              comment: normalizeOptionalString(comment),
            },
            include: {
              reviewer: {
                select: publicUserSelect,
              },
            },
          });

      await tx.notification.create({
        data: {
          userId: request.referrerId,
          requestId: request.id,
          type: "REVIEW_RECEIVED",
          message: `${request.seeker.name} left you a ${rating}-star review for ${request.jobRole} at ${request.company}.`,
        },
      });

      if (!existingReview) {
        await awardCoins(tx, {
          userId: request.referrerId,
          requestId: request.id,
          type: "REVIEW_RECEIVED_BONUS",
          reason: `You received verified seeker feedback for ${request.jobRole} at ${request.company}.`,
        });
      }

      return savedReview;
    });

    return serializeReview(review);
  },

  async getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        request: {
          include: referralRequestInclude,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications.map(serializeNotification);
  },

  async markNotificationAsRead(notificationId: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });

    if (!result.count) {
      throw new AppError(404, "Notification not found");
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      include: {
        request: {
          include: referralRequestInclude,
        },
      },
    });

    if (!notification) {
      throw new AppError(404, "Notification not found");
    }

    return serializeNotification(notification);
  },

  async searchReferrers({ company, skills, query }: SearchReferrersInput) {
    const skillTerms = parseSkills(skills || "");
    const normalizedQuery = query?.trim();
    const normalizedCompany = company?.trim();

    const filters = [
      { role: "REFERRER" as const },
      ...(normalizedCompany
        ? [
            {
              company: {
                contains: normalizedCompany,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(normalizedQuery
        ? [
            {
              OR: [
                { name: { contains: normalizedQuery, mode: "insensitive" as const } },
                { company: { contains: normalizedQuery, mode: "insensitive" as const } },
                { skills: { contains: normalizedQuery, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
      ...skillTerms.map((skill) => ({
        skills: {
          contains: skill,
          mode: "insensitive" as const,
        },
      })),
    ];

    const referrers = await prisma.user.findMany({
      where: {
        AND: filters,
      },
      select: publicUserSelect,
      orderBy: [{ experience: "desc" }, { createdAt: "desc" }],
      take: 24,
    });

    return Promise.all(referrers.map((referrer) => attachReferrerInsights(sanitizeUser(referrer))));
  },

  async getReferrerById(referrerId: string) {
    const referrer = await prisma.user.findFirst({
      where: {
        id: referrerId,
        role: "REFERRER",
      },
      select: publicUserSelect,
    });

    if (!referrer) {
      throw new AppError(404, "Referrer not found");
    }

    return attachReferrerInsights(sanitizeUser(referrer));
  },

  async getDashboardData(userId: string, role: Role) {
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    if (role === "SEEKER") {
      const stats = await getStatusCounts({ seekerId: userId });
      const recentRequests = await prisma.referralRequest.findMany({
        where: {
          seekerId: userId,
        },
        include: referralRequestInclude,
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      });

      return {
        role,
        unreadNotifications,
        stats,
        recentRequests: recentRequests.map(serializeReferralRequest),
      };
    }

    if (role === "REFERRER") {
      const [stats, recentRequests, user] = await Promise.all([
        getStatusCounts({ referrerId: userId }),
        prisma.referralRequest.findMany({
          where: {
            referrerId: userId,
          },
          include: referralRequestInclude,
          orderBy: {
            updatedAt: "desc",
          },
          take: 5,
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { referallyCoins: true },
        }),
      ]);

      return {
        role,
        unreadNotifications,
        stats,
        recentRequests: recentRequests.map(serializeReferralRequest),
        referrerInsights: await buildReferrerInsights(userId, user?.referallyCoins || 0),
      };
    }

    const [
      usersCount,
      requestsCount,
      notificationsCount,
      rewardsCount,
      redemptionsCount,
      roleBreakdown,
      statusBreakdown,
      recentUsers,
      recentRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.referralRequest.count(),
      prisma.notification.count(),
      prisma.rewardItem.count(),
      prisma.rewardRedemption.count(),
      Promise.all([
        prisma.user.count({ where: { role: "SEEKER" } }),
        prisma.user.count({ where: { role: "REFERRER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
      ]),
      Promise.all([
        prisma.referralRequest.count({ where: { status: "REQUESTED" } }),
        prisma.referralRequest.count({ where: { status: "ACCEPTED" } }),
        prisma.referralRequest.count({ where: { status: "REFERRED" } }),
        prisma.referralRequest.count({ where: { status: "REJECTED" } }),
      ]),
      prisma.user.findMany({
        select: publicUserSelect,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      prisma.referralRequest.findMany({
        include: referralRequestInclude,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    return {
      role,
      unreadNotifications,
      stats: {
        usersCount,
        requestsCount,
        notificationsCount,
        rewardsCount,
        redemptionsCount,
      },
      roleBreakdown: {
        seekers: roleBreakdown[0],
        referrers: roleBreakdown[1],
        admins: roleBreakdown[2],
      },
      statusBreakdown: {
        requested: statusBreakdown[0],
        accepted: statusBreakdown[1],
        referred: statusBreakdown[2],
        rejected: statusBreakdown[3],
      },
      recentUsers: recentUsers.map(sanitizeUser),
      recentRequests: recentRequests.map(serializeReferralRequest),
    };
  },

  async getRewardsOverview(userId: string, role: Role) {
    if (!["REFERRER", "ADMIN"].includes(role)) {
      throw new AppError(403, "Only referrers and admins can access rewards");
    }

    const [user, rewards, redemptions, coinTransactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          referallyCoins: true,
          role: true,
        },
      }),
      prisma.rewardItem.findMany({
        where: {
          active: true,
          OR: [{ stock: null }, { stock: { gt: 0 } }],
        },
        orderBy: [{ coinCost: "asc" }, { createdAt: "desc" }],
      }),
      prisma.rewardRedemption.findMany({
        where: { userId },
        include: {
          rewardItem: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.coinTransaction.findMany({
        where: { userId },
        include: {
          request: {
            include: referralRequestInclude,
          },
          redemption: {
            include: {
              rewardItem: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
    ]);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      coinsBalance: user.referallyCoins,
      rewards: rewards.map(serializeRewardItem),
      redemptions: redemptions.map(serializeRewardRedemption),
      coinTransactions: coinTransactions.map(serializeCoinTransaction),
      referrerInsights:
        role === "REFERRER" ? await buildReferrerInsights(userId, user.referallyCoins) : null,
    };
  },

  async redeemReward(userId: string, rewardId: string, role: Role) {
    if (!["REFERRER", "ADMIN"].includes(role)) {
      throw new AppError(403, "Only referrers and admins can redeem rewards");
    }

    const reward = await prisma.rewardItem.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.active) {
      throw new AppError(404, "Reward not found");
    }

    if (reward.stock !== null && reward.stock <= 0) {
      throw new AppError(400, "This reward is out of stock");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referallyCoins: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.referallyCoins < reward.coinCost) {
      throw new AppError(400, "You do not have enough Referrly Coins for this reward");
    }

    const redemption = await prisma.$transaction(async (tx) => {
      if (reward.stock !== null) {
        await tx.rewardItem.update({
          where: { id: reward.id },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          referallyCoins: {
            decrement: reward.coinCost,
          },
        },
        select: {
          referallyCoins: true,
        },
      });

      const createdRedemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardItemId: reward.id,
          coinsSpent: reward.coinCost,
          status: "PROCESSING",
        },
        include: {
          rewardItem: true,
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          type: "REWARD_REDEMPTION",
          amount: -reward.coinCost,
          balanceAfter: updatedUser.referallyCoins,
          reason: `Redeemed ${reward.name}`,
          redemptionId: createdRedemption.id,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: "REWARD_REDEEMED",
          message: `Your redemption for ${reward.name} is now being processed.`,
        },
      });

      return createdRedemption;
    });

    return serializeRewardRedemption(redemption);
  },
};
