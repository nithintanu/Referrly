import { ReactNode } from "react";
import { ArrowRight, Briefcase, BellRing, Coins, Search, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Home = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-[radial-gradient(circle_at_top_left,_rgba(49,182,218,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(123,193,68,0.18),_transparent_30%),linear-gradient(180deg,_#f8fcff,_#eef7fb,_#f6fbf4)]">
      <section className="mx-auto grid max-w-7xl gap-16 px-4 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Referral requests with real workflow tracking
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-slate-950 md:text-6xl">
            Help candidates ask well, help employees respond clearly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Referrly gives seekers a clean way to find referrers, send professional requests, upload resumes,
            and track every status change from requested to referred. Referrers build credibility, collect
            Referrly Coins, and exchange them for platform-funded gift cards, goodies, and learning perks.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register?role=SEEKER"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-[#0f69b5]"
            >
              Start as a seeker
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register?role=REFERRER"
              className="rounded-full border border-secondary/40 bg-white px-6 py-3 text-sm font-semibold text-secondary transition hover:border-secondary hover:text-secondary"
            >
              Join as a referrer
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="grid gap-5">
            <div className="brand-gradient rounded-3xl p-5 text-white shadow-brand">
              <p className="text-sm text-white/75">Status flow</p>
              <p className="mt-3 text-2xl font-semibold">Requested -&gt; Accepted -&gt; Referred</p>
              <p className="mt-2 text-sm text-white/75">Built-in notifications keep both sides aligned.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                icon={<Search size={18} />}
                title="Search referrers"
                description="Filter by company and skills to find the right employee."
              />
              <FeatureCard
                icon={<Briefcase size={18} />}
                title="Upload resumes"
                description="Attach a PDF or DOC resume directly to a request."
              />
              <FeatureCard
                icon={<BellRing size={18} />}
                title="Track updates"
                description="See every request move through the workflow in real time."
              />
              <FeatureCard
                icon={<ShieldCheck size={18} />}
                title="Role aware"
                description="Separate seeker, referrer, and admin views out of the box."
              />
              <FeatureCard
                icon={<Coins size={18} />}
                title="Coins and rewards"
                description="Reward referrers with a visible credibility system and redeemable perks."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
    <div className="inline-flex rounded-2xl bg-white p-2 text-primary shadow-sm">{icon}</div>
    <p className="mt-4 font-semibold text-slate-900">{title}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </div>
);
