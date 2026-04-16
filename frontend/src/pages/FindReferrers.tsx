import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { ReferrerCard } from "../components/ReferrerCard";
import { referralService } from "../services/referralService";
import { User } from "../types";
import { getErrorMessage } from "../utils/api";

export const FindReferrers = () => {
  const navigate = useNavigate();
  const [referrers, setReferrers] = useState<User[]>([]);
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReferrers = async (params?: { company?: string; skills?: string; query?: string }) => {
    setLoading(true);
    setError("");

    try {
      const data = await referralService.searchReferrers(params || {});
      setReferrers(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to search referrers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReferrers();
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadReferrers({
      company: company.trim() || undefined,
      skills: skills.trim() || undefined,
      query: query.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Search</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">Find referrers</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Search by company, skills, or free text. Pick a referrer and move straight into a structured request flow.
        </p>
      </div>

      <form onSubmit={handleSearch} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              placeholder="Google"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Skills</label>
            <input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              placeholder="React, TypeScript"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Keyword</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              placeholder="Frontend"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Search referrers
          </button>
          <button
            type="button"
            onClick={() => {
              setCompany("");
              setSkills("");
              setQuery("");
              void loadReferrers();
            }}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
          >
            Reset filters
          </button>
        </div>
      </form>

      <div className="mt-8">
        {error ? <Alert message={error} /> : null}
        {loading ? <LoadingState message="Searching referrers..." /> : null}

        {!loading && !error ? (
          referrers.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {referrers.map((referrer) => (
                <ReferrerCard
                  key={referrer.id}
                  referrer={referrer}
                  onSelect={(referrerId) => navigate(`/create-request?referrerId=${referrerId}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No referrers matched"
              description="Try broadening the company or skills filters and search again."
            />
          )
        ) : null}
      </div>
    </div>
  );
};
