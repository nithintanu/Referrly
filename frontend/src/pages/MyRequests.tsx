import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestCard } from "../components/RequestCard";
import { referralService } from "../services/referralService";
import { ReferralRequest, RequestStatus } from "../types";
import { getErrorMessage } from "../utils/api";

const FILTERS: Array<RequestStatus | "ALL"> = ["ALL", "REQUESTED", "ACCEPTED", "REFERRED", "REJECTED"];

export const MyRequests = () => {
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewingRequestId, setReviewingRequestId] = useState("");

  const loadRequests = async (filter: RequestStatus | "ALL") => {
    setLoading(true);
    setError("");

    try {
      const data = await referralService.getMyRequests(filter);
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests(statusFilter);
  }, [statusFilter]);

  const handleReviewSubmit = async (requestId: string) => {
    const draft = reviewDrafts[requestId] || { rating: 5, comment: "" };
    setReviewingRequestId(requestId);
    setError("");

    try {
      await referralService.submitReview(requestId, draft);
      await loadRequests(statusFilter);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit feedback"));
    } finally {
      setReviewingRequestId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Seeker workflow</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">My requests</h1>
          <p className="mt-3 text-sm text-slate-600">
            Track every referral request from requested to referred, then leave feedback once help is delivered.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === filter
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error ? <Alert message={error} /> : null}
      {loading ? <LoadingState message="Loading requests..." /> : null}

      {!loading && !error ? (
        requests.length ? (
          <div className="space-y-4">
            {requests.map((request) => {
              const myReview = request.reviews.find((review) => review.reviewerId === request.seekerId);
              const draft = reviewDrafts[request.id] || { rating: 5, comment: "" };

              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  variant="seeker"
                  extraContent={
                    request.status === "REFERRED" ? (
                      myReview ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                          Your feedback is on file. It now contributes to this referrer&apos;s credibility profile and rewards progress.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leave referrer feedback</p>
                              <p className="mt-2 text-sm text-slate-600">
                                Your review helps track referrer credibility and unlock platform-funded rewards.
                              </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
                                <select
                                  value={draft.rating}
                                  onChange={(event) =>
                                    setReviewDrafts((current) => ({
                                      ...current,
                                      [request.id]: {
                                        ...draft,
                                        rating: Number(event.target.value),
                                      },
                                    }))
                                  }
                                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                                >
                                  {[5, 4, 3, 2, 1].map((value) => (
                                    <option key={value} value={value}>
                                      {value} star{value === 1 ? "" : "s"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Comment</label>
                                <textarea
                                  value={draft.comment}
                                  onChange={(event) =>
                                    setReviewDrafts((current) => ({
                                      ...current,
                                      [request.id]: {
                                        ...draft,
                                        comment: event.target.value,
                                      },
                                    }))
                                  }
                                  rows={3}
                                  placeholder="What was helpful about the referral support?"
                                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  void handleReviewSubmit(request.id);
                                }}
                                disabled={reviewingRequestId === request.id}
                                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {reviewingRequestId === request.id ? "Submitting..." : "Submit feedback"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ) : null
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No requests in this view"
            description="Create a new referral request or switch filters to review your history."
            action={
              <Link to="/find-referrers" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Find referrers
              </Link>
            }
          />
        )
      ) : null}
    </div>
  );
};
