import { AlertCircle, RefreshCw } from "lucide-react";

export function PageError({ message = "Failed to load data", onRetry }: { message?: string; onRetry?: () => void }) {
    return (
        <div className="flex min-h-[50vh] sm:min-h-[60vh] w-full flex-col items-center justify-center px-4 py-8 text-center space-y-4">
            <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:px-5 sm:py-4 text-rose-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm font-medium leading-relaxed break-words text-left">
                    {message}
                </div>
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-sm font-medium text-textPrimary transition hover:bg-surfaceVariant"
                >
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    <span>Retry</span>
                </button>
            )}
        </div>
    );
}
