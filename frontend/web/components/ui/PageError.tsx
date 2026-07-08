import { AlertCircle } from "lucide-react";
import Button from "./Button";

export function PageError({ message = "Failed to load data", onRetry }: { message?: string; onRetry?: () => void }) {
    return (
        <div className="flex min-h-[50vh] sm:min-h-[60vh] w-full flex-col items-center justify-center px-4 py-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-error/30 bg-errorLight/45 px-4 py-3 sm:px-5 sm:py-4 text-errorDark glass-surface shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                <div className="text-sm font-mono font-medium leading-relaxed break-words text-left">
                    {message}
                </div>
            </div>

            {onRetry && (
                <Button
                    onClick={onRetry}
                    variant="subtle"
                    size="sm"
                    className="gap-2 active:scale-[0.96]"
                >
                    Retry
                </Button>
            )}
        </div>
    );
}
