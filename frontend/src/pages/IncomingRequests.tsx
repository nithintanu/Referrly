import { useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { RequestCard } from "../components/RequestCard";
import { useAuth } from "../context/AuthContext";
import { referralService } from "../services/referralService";
import { ReferralRequest, RequestStatus } from "../types";
import { getErrorMessage } from "../utils/api";

const FILTERS: Array<RequestStatus | "ALL"> = ["ALL", "REQUESTED", "ACCEPTED", "REFERRED", "REJECTED"];

export const IncomingRequests = () => {
  const { refreshUser } = useAuth();
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    requestId: string;
    status: RequestStatus | null;
  }>({ requestId: "", status: null });

  const loadRequests = async (filter: RequestStatus | "ALL") => {
    setLoading(true);
    setError("");

    try {
      const data = await referralService.getIncomingRequests(filter);
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load incoming requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = async (
    requestId: string,
    status: Exclude<RequestStatus, "REQUESTED">
  ) => {
    setPendingAction({ requestId, status });

    try {
      await referralService.updateRequestStatus(requestId, status);
      await Promise.all([loadRequests(statusFilter), refreshUser()]);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update request status"));
    } finally {
      setPendingAction({ requestId: "", status: null });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Referrer workflow</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Incoming requests</h1>
          <p className="mt-3 text-sm text-slate-600">Review requests, accept strong candidates, and mark referrals complete.</p>
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
      {loading ? <LoadingState message="Loading incoming requests..." /> : null}

      {!loading && !error ? (
        requests.length ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                variant="referrer"
                actionLoadingStatus={
                  pendingAction.requestId === request.id ? pendingAction.status : null
                }
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No incoming requests"
            description="New seeker requests will appear here once they target your company and skills."
          />
        )
      ) : null}
    </div>
  );
};
