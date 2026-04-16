import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestCard } from "../components/RequestCard";
import { referralService } from "../services/referralService";
import { DashboardData, ReferrerStats, User } from "../types";
import { getErrorMessage } from "../utils/api";
import { joinSkills } from "../utils/format";

export const Dashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await referralService.getDashboardData();
        setDashboard(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState fullScreen message="Loading dashboard..." />;
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Alert message={error || "Dashboard could not be loaded."} />
      </div>
    );
  }

  const isAdmin = dashboard.role === "ADMIN";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            {isAdmin ? "Platform overview" : dashboard.role === "REFERRER" ? "Incoming referral activity" : "Your referral progress"}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {dashboard.unreadNotifications} unread notification{dashboard.unreadNotifications === 1 ? "" : "s"}
          </p>
        </div>
        {!isAdmin && dashboard.role === "SEEKER" ? (
          <div className="flex flex-wrap gap-3">
            <Link to="/find-referrers" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Find referrers
            </Link>
            <Link to="/profile" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900">
              Update profile
            </Link>
          </div>
        ) : null}
      </div>

      {isAdmin ? <AdminDashboard dashboard={dashboard} /> : <UserDashboard dashboard={dashboard} />}
    </div>
  );
};

const UserDashboard = ({ dashboard }: { dashboard: DashboardData }) => {
  const stats = dashboard.stats as {
    totalRequests: number;
    requestedRequests: number;
    acceptedRequests: number;
    referredRequests: number;
    rejectedRequests: number;
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total requests" value={stats.totalRequests} />
        <StatCard label="Requested" value={stats.requestedRequests} tone="amber" />
        <StatCard label="Accepted" value={stats.acceptedRequests} tone="sky" />
        <StatCard label="Referred" value={stats.referredRequests} tone="emerald" />
        <StatCard label="Rejected" value={stats.rejectedRequests} tone="rose" />
      </div>

      {dashboard.role === "REFERRER" && dashboard.referrerInsights ? (
        <ReferrerRewardsPanel insights={dashboard.referrerInsights} />
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Recent requests</h2>
          <Link
            to={dashboard.role === "REFERRER" ? "/incoming-requests" : "/my-requests"}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {dashboard.recentRequests.length ? (
          <div className="space-y-4">
            {dashboard.recentRequests.map((request) => (
              <RequestCard key={request.id} request={request} variant={dashboard.role === "REFERRER" ? "referrer" : "seeker"} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No requests yet"
            description={
              dashboard.role === "SEEKER"
                ? "Start by searching referrers and creating your first request."
                : "Incoming requests will appear here once seekers reach out."
            }
            action={
              dashboard.role === "SEEKER" ? (
                <Link to="/find-referrers" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Browse referrers
                </Link>
              ) : null
            }
          />
        )}
      </section>
    </>
  );
};

const AdminDashboard = ({ dashboard }: { dashboard: DashboardData }) => {
  const stats = dashboard.stats as {
    usersCount: number;
    requestsCount: number;
    notificationsCount: number;
    rewardsCount: number;
    redemptionsCount: number;
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={stats.usersCount} />
        <StatCard label="Requests" value={stats.requestsCount} tone="sky" />
        <StatCard label="Notifications" value={stats.notificationsCount} tone="emerald" />
        <StatCard label="Rewards" value={stats.rewardsCount} tone="amber" />
        <StatCard label="Redemptions" value={stats.redemptionsCount} tone="rose" />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Panel title="Role breakdown">
          <BreakdownRow label="Seekers" value={dashboard.roleBreakdown?.seekers || 0} />
          <BreakdownRow label="Referrers" value={dashboard.roleBreakdown?.referrers || 0} />
          <BreakdownRow label="Admins" value={dashboard.roleBreakdown?.admins || 0} />
        </Panel>

        <Panel title="Request status breakdown">
          <BreakdownRow label="Requested" value={dashboard.statusBreakdown?.requested || 0} />
          <BreakdownRow label="Accepted" value={dashboard.statusBreakdown?.accepted || 0} />
          <BreakdownRow label="Referred" value={dashboard.statusBreakdown?.referred || 0} />
          <BreakdownRow label="Rejected" value={dashboard.statusBreakdown?.rejected || 0} />
        </Panel>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Newest users">
          <div className="space-y-4">
            {(dashboard.recentUsers || []).map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        </Panel>

        <Panel title="Newest requests">
          <div className="space-y-4">
            {dashboard.recentRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
};

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    <div className="mt-5">{children}</div>
  </section>
);

const ReferrerRewardsPanel = ({ insights }: { insights: ReferrerStats }) => (
  <section className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
    <Panel title="Credibility and rewards">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Credibility score" value={insights.credibilityScore} tone="sky" />
        <StatCard label="Coins" value={insights.referallyCoins} tone="amber" />
        <StatCard label="Average rating" value={insights.averageRating.toFixed(1)} tone="emerald" />
        <StatCard label="Response %" value={insights.responseRate} tone="slate" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {insights.badges.map((badge) => (
          <span key={badge} className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-900">
            {badge}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        You earn Referrly Coins for responsive actions, completed referrals, and verified seeker feedback.
        Coins can be redeemed for gift cards, goodies, and learning perks from the rewards page.
      </div>
    </Panel>

    <Panel title="Impact summary">
      <BreakdownRow label="Pending requests" value={insights.pendingRequests} />
      <BreakdownRow label="Accepted" value={insights.acceptedRequests} />
      <BreakdownRow label="Completed referrals" value={insights.referredRequests} />
      <BreakdownRow label="Reviews received" value={insights.totalReviews} />
      <BreakdownRow label="Acceptance %" value={insights.acceptanceRate} />
    </Panel>
  </section>
);

const StatCard = ({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  tone?: "slate" | "sky" | "amber" | "emerald" | "rose";
}) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-900",
    sky: "bg-sky-100 text-sky-900",
    amber: "bg-amber-100 text-amber-900",
    emerald: "bg-emerald-100 text-emerald-900",
    rose: "bg-rose-100 text-rose-900",
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{label}</div>
      <p className="mt-6 text-4xl font-semibold text-slate-950">{value}</p>
    </div>
  );
};

const BreakdownRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const UserRow = ({ user }: { user: User }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold text-slate-900">{user.name}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>
      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{user.role}</span>
    </div>
    <p className="mt-3 text-sm text-slate-500">{joinSkills(user.skills)}</p>
  </div>
);
