import { Loader2 } from "lucide-react";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex min-h-[50vh] sm:min-h-[60vh] w-full flex-col items-center justify-center px-4 py-8 text-center text-textSecondary">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-2">
                <Loader2 className="h-6 w-6 sm:h-5 sm:w-5 animate-spin shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed break-words">
                    {message}
                </span>
            </div>
        </div>
    );
}
