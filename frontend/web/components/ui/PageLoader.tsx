import React from "react";
import { LogoIcon } from "./Logo";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
	return (
		<div className="flex min-h-[50vh] sm:min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12 text-center text-textSecondary">
			<div className="flex flex-col items-center gap-5">
				{/* Branded pulsing loader */}
				<div className="relative flex items-center justify-center">
					{/* Spinning tracking circle */}
					<div className="h-16 w-16 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
					{/* Pulsing brand icon in center */}
					<div className="absolute animate-pulse">
						<LogoIcon size={32} />
					</div>
				</div>
				<span className="text-sm font-semibold sm:text-base leading-relaxed break-words text-textPrimary tracking-wide animate-pulse">
					{message}
				</span>
			</div>
		</div>
	);
}
