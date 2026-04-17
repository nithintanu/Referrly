import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = useMemo(
    () => (searchParams.get("role") === "REFERRER" ? "REFERRER" : "SEEKER"),
    [searchParams]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SEEKER" | "REFERRER">(initialRole);
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        name,
        email,
        password,
        role,
        company,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        experience: experience ? Number(experience) : null,
        bio,
        linkedinUrl,
        portfolioUrl,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-6xl items-center px-4 py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create your login and add the basics now, so your profile is useful from the moment it appears.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? <Alert message={error} /> : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Ada Lovelace"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole("SEEKER")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    role === "SEEKER"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="font-semibold">Seeker</p>
                  <p className={`mt-1 text-sm ${role === "SEEKER" ? "text-slate-200" : "text-slate-500"}`}>
                    Search referrers, upload resumes, and track every request.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("REFERRER")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    role === "REFERRER"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="font-semibold">Referrer</p>
                  <p className={`mt-1 text-sm ${role === "REFERRER" ? "text-slate-200" : "text-slate-500"}`}>
                    Review incoming requests, accept or reject them, and mark referrals complete.
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Basic profile details</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    These fields save an extra setup step later and help keep public profiles complete.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {role === "REFERRER" ? "Required for referrers" : "Optional for seekers"}
                </span>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder={role === "REFERRER" ? "Current company" : "Target companies"}
                    required={role === "REFERRER"}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Experience (years)</label>
                  <input
                    type="number"
                    min={0}
                    value={experience}
                    onChange={(event) => setExperience(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Skills</label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="React, Node.js, PostgreSQL"
                  required={role === "REFERRER"}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                  placeholder="Add a short professional summary."
                  required={role === "REFERRER"}
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Portfolio URL</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(event) => setPortfolioUrl(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                    placeholder="https://your-site.dev"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        <section className="rounded-[2rem] bg-[linear-gradient(135deg,_#0f172a,_#1e293b,_#0f766e)] p-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Built for technical interviews</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight">Production-shaped flows, not just screens.</h2>
          <ul className="mt-8 space-y-4 text-sm text-slate-200">
            <li>JWT auth with role-aware routing for seekers, referrers, and admins.</li>
            <li>Request lifecycle tracking with notifications stored in PostgreSQL.</li>
            <li>Search and filters for referrers plus upload-ready request creation.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
