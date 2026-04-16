import { type ReactNode, useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, Coins, Gift, Sparkles } from "lucide-react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { referralService } from "../services/referralService";
import { CoinTransaction, RewardItem, RewardsOverview } from "../types";
import { getErrorMessage } from "../utils/api";
import { formatDateTime } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const formatCategory = (value: RewardItem["category"]) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const activitySteps = [
  {
    title: "Accept a request",
    description: "Rewarded when you respond positively and move a request forward.",
    points: 20,
  },
  {
    title: "Complete the referral",
    description: "Added after you confirm the referral was actually completed.",
    points: 30,
  },
  {
    title: "Receive verified feedback",
    description: "Granted when the seeker leaves feedback after the referral cycle closes.",
    points: 20,
  },
] as const;

const getRewardVisual = (reward: RewardItem) => {
  if (reward.slug.includes("swag")) {
    return "/images/Swag-Pack.png";
  }

  if (reward.slug.includes("amazon")) {
    return "/images/Amazon-giftCard.png";
  }

  return "/images/Referrly-Logo.png";
};

const getTransactionTone = (transaction: CoinTransaction) =>
  transaction.amount < 0
    ? {
        pill: "bg-rose-100 text-rose-700",
        text: "text-rose-600",
        label: "Spent",
      }
    : {
        pill: "bg-emerald-100 text-emerald-700",
        text: "text-emerald-600",
        label: "Earned",
      };

export const Rewards = () => {
  const { user, refreshUser } = useAuth();
  const [overview, setOverview] = useState<RewardsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemingRewardId, setRedeemingRewardId] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await referralService.getRewardsOverview();
      setOverview(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load rewards"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const handleRedeem = async (rewardId: string) => {
    setRedeemingRewardId(rewardId);
    setError("");

    try {
      await referralService.redeemReward(rewardId);
      await Promise.all([loadOverview(), refreshUser()]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to redeem reward"));
    } finally {
      setRedeemingRewardId("");
    }
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading rewards..." />;
  }

  if (error || !overview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Alert message={error || "Rewards data could not be loaded."} />
      </div>
    );
  }

  const canRedeem = user?.role === "REFERRER";
  const totalActivityPoints = activitySteps.reduce((sum, step) => sum + step.points, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(49,182,218,0.2),_transparent_26%),linear-gradient(135deg,_#ffffff,_#f8fbff_45%,_#f4faf4)] p-6 shadow-sm md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 shadow-sm">
              <Coins size={14} />
              Referrly Rewards
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold text-slate-950 md:text-5xl">
              A cleaner way to track, earn, and redeem points.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              See your current balance, understand how each referral milestone earns points, and redeem
              platform-funded perks without digging through crowded cards.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SummaryCard
                icon={<Coins size={18} />}
                label="Available balance"
                value={overview.coinsBalance}
                detail="Ready for rewards"
                tone="amber"
              />
              <SummaryCard
                icon={<Sparkles size={18} />}
                label="Max per activity"
                value={totalActivityPoints}
                detail="Across one full cycle"
                tone="sky"
              />
              <SummaryCard
                icon={<Gift size={18} />}
                label="Catalog items"
                value={overview.rewards.length}
                detail="Ready to redeem"
                tone="emerald"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Featured reward</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">Swag pack and perks</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Rewards stay platform-funded, so referrers get a clear upside and seekers never have to
                  negotiate extras.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <img
              src="/images/Swag-Pack.png"
              alt="Referrly swag pack"
              className="mt-5 h-48 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 object-cover p-3"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">Gift cards</span>
              <span className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-800">Goodies</span>
              <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
                Learning perks
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mt-6">
          <Alert message={error} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How points add up</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">One referral cycle now tops out at 70 points</h2>
              <p className="mt-2 text-sm text-slate-600">
                The earning path is split across three milestones so progress feels steady instead of lopsided.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {activitySteps.map((step) => (
                <article key={step.title} className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-semibold text-slate-900 md:text-base">{step.title}</p>
                    <span className="whitespace-nowrap rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                      {step.points} pts
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Rewards catalog</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Clearer cards, faster scanning, and only platform-funded perks in the exchange.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                {overview.rewards.length} reward{overview.rewards.length === 1 ? "" : "s"} available
              </div>
            </div>

            {overview.rewards.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {overview.rewards.map((reward) => {
                  const outOfStock = reward.stock !== null && reward.stock !== undefined && reward.stock <= 0;
                  const insufficientCoins = overview.coinsBalance < reward.coinCost;
                  const isRedeeming = redeemingRewardId === reward.id;

                  return (
                    <article key={reward.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
                      <div className="border-b border-slate-200 bg-white p-2.5">
                        <img
                          src={getRewardVisual(reward)}
                          alt={reward.name}
                          className="h-32 w-full rounded-3xl bg-slate-50 object-contain p-2.5"
                        />
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">{reward.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{formatCategory(reward.category)}</p>
                          </div>
                          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                            {reward.coinCost} pts
                          </div>
                        </div>
                        <p className="mt-2.5 min-h-[56px] text-sm leading-6 text-slate-600">{reward.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600">
                            {reward.stock === null || reward.stock === undefined ? "Always available" : `${reward.stock} left`}
                          </span>
                          {insufficientCoins ? (
                            <span className="rounded-full bg-rose-100 px-3 py-2 text-xs font-medium text-rose-700">
                              Need {reward.coinCost - overview.coinsBalance} more pts
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-medium text-emerald-700">
                              Balance covers this
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">
                            Redemption is instant and logged below.
                          </div>
                          {canRedeem ? (
                            <button
                              onClick={() => {
                                void handleRedeem(reward.id);
                              }}
                              disabled={outOfStock || insufficientCoins || Boolean(redeemingRewardId)}
                              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f69b5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isRedeeming ? "Redeeming..." : outOfStock ? "Out of stock" :  "Redeem"}
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-500">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No rewards listed"
                  description="Add items to the catalog to let referrers exchange points for platform perks."
                />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {overview.referrerInsights ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Credibility profile</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MetricCard label="Credibility score" value={overview.referrerInsights.credibilityScore} />
                <MetricCard label="Average rating" value={overview.referrerInsights.averageRating.toFixed(1)} tone="sky" />
                <MetricCard label="Response %" value={overview.referrerInsights.responseRate} tone="emerald" />
                <MetricCard label="Completed referrals" value={overview.referrerInsights.referredRequests} tone="amber" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {overview.referrerInsights.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-800"
                  >
                    <BadgeCheck size={14} />
                    {badge}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Recent redemptions</h2>
            {overview.redemptions.length ? (
              <div className="mt-5 space-y-3">
                {overview.redemptions.slice(0, 6).map((redemption) => (
                  <div key={redemption.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{redemption.rewardItem.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDateTime(redemption.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        {redemption.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{redemption.coinsSpent} pts spent</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="No redemptions yet"
                  description="Redeemed rewards will show up here once you exchange your first batch of points."
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Points activity</h2>
            <p className="mt-2 text-sm text-slate-600">Every reward and earning milestone appears here in time order.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Latest balance: {overview.coinsBalance}
          </div>
        </div>
        {overview.coinTransactions.length ? (
          <div className="mt-6 space-y-3">
            {overview.coinTransactions.map((transaction) => {
              const tone = getTransactionTone(transaction);

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.pill}`}>{tone.label}</span>
                      <p className="font-semibold text-slate-900">{transaction.reason}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{formatDateTime(transaction.createdAt)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`text-lg font-semibold ${tone.text}`}>
                      {transaction.amount < 0 ? transaction.amount : `+${transaction.amount}`} pts
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Balance after: {transaction.balanceAfter}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No points activity yet"
              description="Points will appear here after accepted requests, completed referrals, or verified seeker feedback."
            />
          </div>
        )}
      </section>
    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  detail: string;
  tone: "amber" | "sky" | "emerald";
}) => {
  const toneClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };

  return (
    <div className={`rounded-[1.5rem] border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        <div className="rounded-full bg-white/80 p-2">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm opacity-80">{detail}</p>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  tone?: "slate" | "sky" | "emerald" | "amber";
}) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-900",
    sky: "bg-sky-100 text-sky-900",
    emerald: "bg-emerald-100 text-emerald-900",
    amber: "bg-amber-100 text-amber-900",
  };

  return (
    <div className={`rounded-2xl border border-white/60 px-4 py-5 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
};
