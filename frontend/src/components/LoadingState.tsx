interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) => (
  <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-16"}`}>
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  </div>
);
