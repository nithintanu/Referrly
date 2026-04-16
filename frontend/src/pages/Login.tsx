import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

const demoAccounts = [
  { label: "Seeker", email: "seeker1@example.com", password: "password123" },
  { label: "Referrer", email: "referrer1@google.com", password: "password123" },
  { label: "Admin", email: "admin@referrly.com", password: "password123" },
] as const;

export const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login({ email: email.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-7xl items-center px-4 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-slate-900 p-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Welcome back</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Sign in to manage referrals with a real workflow.</h1>
          <p className="mt-5 max-w-lg text-slate-300">
            Use one of the seeded accounts or your own registered credentials to open dashboards, track requests,
            and handle notifications.
          </p>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <p className="font-semibold text-white">Demo accounts</p>
            <p className="mt-3">Seeker: seeker1@example.com / password123</p>
            <p>Referrer: referrer1@google.com / password123</p>
            <p>Admin: admin@referrly.com / password123</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h2 className="text-3xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Use your email and password to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? <Alert message={error} /> : null}

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Quick fill demo account</p>
              <div className="flex flex-wrap gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.label}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setError("");
                    }}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="password123"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New here?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
