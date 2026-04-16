import { ReactNode } from "react";
import { ReferralRequest, RequestStatus } from "../types";
import { formatDateTime } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface RequestCardProps {
  request: ReferralRequest;
  variant?: "seeker" | "referrer";
  actionLoadingStatus?: RequestStatus | null;
  onStatusChange?: (requestId: string, status: Exclude<RequestStatus, "REQUESTED">) => Promise<void> | void;
  extraContent?: ReactNode;
}

export const RequestCard = ({
  request,
  variant = "seeker",
  actionLoadingStatus,
  onStatusChange,
  extraContent,
}: RequestCardProps) => {
  const isReferrerView = variant === "referrer";
  const latestReview = request.reviews[0];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-900">{request.company}</h3>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600">{request.jobRole}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{request.jobDescription}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <p>Created {formatDateTime(request.createdAt)}</p>
          <p className="mt-1">Updated {formatDateTime(request.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {isReferrerView ? "Requested by" : "Sent to"}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {isReferrerView ? request.seeker.name : request.referrer.name}
          </p>
          <p className="text-sm text-slate-600">
            {(isReferrerView ? request.seeker.email : request.referrer.email) || "No email available"}
          </p>
          <p className="text-sm text-slate-500">
            {(isReferrerView ? request.seeker.company : request.referrer.company) || "Company not provided"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {request.message || "No personal message attached."}
          </p>
          {request.resumeUrl ? (
            <a
              href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${request.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              View uploaded resume
            </a>
          ) : null}
        </div>
      </div>

      {latestReview ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Latest seeker feedback</p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
              {latestReview.rating}/5 stars
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900">{latestReview.reviewer.name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {latestReview.comment || "This review was submitted without a written comment."}
          </p>
        </div>
      ) : null}

      {isReferrerView && onStatusChange ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {request.status === "REQUESTED" ? (
            <>
              <button
                onClick={() => {
                  void onStatusChange(request.id, "ACCEPTED");
                }}
                disabled={actionLoadingStatus !== null}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoadingStatus === "ACCEPTED" ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => {
                  void onStatusChange(request.id, "REJECTED");
                }}
                disabled={actionLoadingStatus !== null}
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoadingStatus === "REJECTED" ? "Rejecting..." : "Reject"}
              </button>
            </>
          ) : null}

          {request.status === "ACCEPTED" ? (
            <button
              onClick={() => {
                void onStatusChange(request.id, "REFERRED");
              }}
              disabled={actionLoadingStatus !== null}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoadingStatus === "REFERRED" ? "Updating..." : "Mark as Referred"}
            </button>
          ) : null}
        </div>
      ) : null}

      {extraContent ? <div className="mt-5">{extraContent}</div> : null}
    </article>
  );
};
