import { User } from "../types";
import { joinSkills } from "../utils/format";

interface ReferrerCardProps {
  referrer: User;
  onSelect: (referrerId: string) => void;
}

export const ReferrerCard = ({ referrer, onSelect }: ReferrerCardProps) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-lg font-semibold text-slate-900">{referrer.name}</p>
        <p className="text-sm font-medium text-primary">{referrer.company || "Company not added"}</p>
      </div>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        {referrer.experience ?? 0}+ years
      </span>
    </div>

    <p className="mt-4 text-sm leading-6 text-slate-600">
      {referrer.profile?.bio || "This referrer has not added a bio yet."}
    </p>

    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
      <p className="mt-2 text-sm text-slate-600">{joinSkills(referrer.skills)}</p>
    </div>

    {referrer.referrerStats ? (
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Credibility</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{referrer.referrerStats.credibilityScore}</p>
          <p className="mt-1 text-xs text-slate-500">
            {referrer.referrerStats.averageRating.toFixed(1)} rating • {referrer.referrerStats.referredRequests} completed referrals
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Referrly Coins</p>
          <p className="mt-2 text-2xl font-semibold text-amber-900">{referrer.referrerStats.referallyCoins}</p>
          <p className="mt-1 text-xs text-amber-700">Earned through accepted requests, referrals, and feedback</p>
        </div>
      </div>
    ) : null}

    {referrer.referrerStats?.badges?.length ? (
      <div className="mt-5 flex flex-wrap gap-2">
        {referrer.referrerStats.badges.map((badge) => (
          <span key={badge} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
            {badge}
          </span>
        ))}
      </div>
    ) : null}

    <div className="mt-6 flex items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        {referrer.profile?.linkedinUrl ? (
          <a href={referrer.profile.linkedinUrl} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            View LinkedIn
          </a>
        ) : (
          "LinkedIn not provided"
        )}
      </div>
      <button
        onClick={() => onSelect(referrer.id)}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Request Referral
      </button>
    </div>
  </article>
);
