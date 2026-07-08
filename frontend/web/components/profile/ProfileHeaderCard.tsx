import React from "react";
import { TiltCard } from "@/components/ui/TiltCard";
import Card from "@/components/ui/Card";
import SafeImage from "@/components/ui/SafeImage";

export type ProfileHeaderCardProps = {
	avatarUrl?: string | null;
	initials: string;
	avatarBadge?: React.ReactNode;
	avatarBgClass?: string;
	name: string;
	nameBadge?: React.ReactNode;
	infoRows: {
		icon?: React.ReactNode;
		text: React.ReactNode;
	}[];
	actions?: React.ReactNode;
	rightContent?: React.ReactNode;
};

export function ProfileHeaderCard({
	avatarUrl,
	initials,
	avatarBadge,
	avatarBgClass = "bg-primaryLight text-primary",
	name,
	nameBadge,
	infoRows,
	actions,
	rightContent,
}: ProfileHeaderCardProps) {
	return (
		<TiltCard>
			<Card
				padding="none"
				className="overflow-hidden rounded-[32px] border border-borderLight bg-surface p-6 sm:p-8"
			>
				<div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-center sm:text-left">
					<div
						className={`relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[32px] border border-borderLight text-5xl font-extrabold sm:h-36 sm:w-36 ${avatarBgClass}`}
					>
						{avatarUrl ? (
							<SafeImage
								src={avatarUrl}
								alt={name}
								fill
								className="object-cover"
								sizes="144px"
							/>
						) : (
							initials
						)}
						{avatarBadge && (
							<span className="absolute bottom-2 right-2 rounded-full border-2 border-surface p-1.5 shadow-sm z-10">
								{avatarBadge}
							</span>
						)}
					</div>

					<div className="flex flex-1 flex-col items-center sm:items-start w-full">
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							<h1 className="text-center text-2xl font-bold tracking-tight text-textPrimary sm:text-left sm:text-[1.75rem]">
								{name}
							</h1>
							{nameBadge}
						</div>

						<div className="mt-2 space-y-2 text-sm text-textSecondary">
							{infoRows.map((row, idx) => (
								<div
									key={idx}
									className="flex items-center justify-center gap-2 sm:justify-start font-medium"
								>
									{row.icon && <span className="shrink-0">{row.icon}</span>}
									<span>{row.text}</span>
								</div>
							))}
						</div>

						{actions && (
							<div className="mt-6 flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
								{actions}
							</div>
						)}
					</div>

					{rightContent && (
						<div className="mt-6 flex shrink-0 items-center justify-center w-full sm:w-auto">
							{rightContent}
						</div>
					)}
				</div>
			</Card>
		</TiltCard>
	);
}
