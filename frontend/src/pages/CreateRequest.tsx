import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { referralService } from "../services/referralService";
import { User } from "../types";
import { getErrorMessage } from "../utils/api";
import { joinSkills } from "../utils/format";

export const CreateRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerId = searchParams.get("referrerId");
  const [selectedReferrer, setSelectedReferrer] = useState<User | null>(null);
  const [loadingReferrer, setLoadingReferrer] = useState(Boolean(referrerId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    jobRole: "",
    jobDescription: "",
    message: "",
  });

  useEffect(() => {
    const loadReferrer = async () => {
      if (!referrerId) {
        setLoadingReferrer(false);
        return;
      }

      setLoadingReferrer(true);
      setError("");

      try {
        const referrer = await referralService.getReferrerById(referrerId);
        setSelectedReferrer(referrer);
        setFormData((current) => ({
          ...current,
          company: current.company || referrer.company || "",
        }));
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load referrer details"));
      } finally {
        setLoadingReferrer(false);
      }
    };

    void loadReferrer();
  }, [referrerId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!referrerId) {
      setError("Please select a referrer before creating a request.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("referrerId", referrerId);
      payload.append("company", formData.company);
      payload.append("jobRole", formData.jobRole);
      payload.append("jobDescription", formData.jobDescription);
      payload.append("message", formData.message);

      if (resume) {
        payload.append("resume", resume);
      }

      await referralService.createRequest(payload);
      setSuccess("Referral request created successfully.");

      window.setTimeout(() => {
        navigate("/my-requests");
      }, 1000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create the request"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingReferrer) {
    return <LoadingState fullScreen message="Loading referrer details..." />;
  }

  if (!referrerId || !selectedReferrer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState
          title="Choose a referrer first"
          description="Select a referrer from the search page before creating a request."
          action={
            <Link to="/find-referrers" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Find referrers
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Create request</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">Send a referral request</h1>
        <p className="mt-3 text-sm text-slate-600">
          Keep it concise, attach your resume, and send a request the referrer can act on immediately.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected referrer</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{selectedReferrer.name}</h2>
          <p className="mt-1 text-sm font-medium text-primary">{selectedReferrer.company}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {selectedReferrer.profile?.bio || "No bio available for this referrer yet."}
          </p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Skills</p>
            <p className="mt-2">{joinSkills(selectedReferrer.skills)}</p>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <Alert message={error} /> : null}
            {success ? <Alert message={success} tone="success" /> : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
              <input
                value={formData.company}
                onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Job title</label>
              <input
                value={formData.jobRole}
                onChange={(event) => setFormData((current) => ({ ...current, jobRole: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Senior Frontend Engineer"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Job description</label>
              <textarea
                value={formData.jobDescription}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, jobDescription: event.target.value }))
                }
                rows={6}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Paste the key parts of the job description here..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Personal message</label>
              <textarea
                value={formData.message}
                onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                rows={4}
                maxLength={400}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="Briefly explain your background and why this role is a fit."
              />
              <p className="mt-2 text-xs text-slate-500">{formData.message.length}/400 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Resume upload</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => setResume(event.target.files?.[0] || null)}
                className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-600"
              />
              <p className="mt-2 text-xs text-slate-500">PDF, DOC, or DOCX up to 5 MB.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Submitting request..." : "Submit referral request"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
