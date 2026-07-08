import React from "react";
import { LucideIcon } from "lucide-react";
import { LogoIcon } from "./Logo";

export function PageEmpty({
	icon: Icon,
	title,
	description,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
}) {
	return (
		<div className="relative overflow-hidden flex min-h-[220px] sm:min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-borderLight bg-surface/50 shadow-inner px-4 py-8 sm:p-6 backdrop-blur-[1px]">
			{/* Muted background watermark logo */}
			<div className="absolute right-3 top-3 opacity-[0.07] pointer-events-none animate-float">
				<LogoIcon size={36} />
			</div>

			<Icon className="h-8 w-8 sm:h-10 sm:w-10 text-textTertiary animate-float" />
			<h3 className="mt-4 text-base sm:text-lg font-bold font-mono text-textPrimary break-words">
				{title}
			</h3>
			<p className="mt-2 max-w-md text-sm leading-relaxed text-textSecondary break-words">
				{description}
			</p>
		</div>
	);
}
