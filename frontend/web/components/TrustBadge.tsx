import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TrustBadgeProps {
	score?: number;
	showIcon?: boolean;
	compact?: boolean; // For minimal badge style
}

const TrustBadge = ({ score = 95, showIcon = true, compact = false }: TrustBadgeProps) => {
	// Determine color based on score
	const getColor = () => {
		if (score >= 100) return 'text-success bg-successLight';
		if (score >= 70) return 'text-primary bg-primaryLight';
		if (score >= 50) return 'text-warning bg-warningLight';
		return 'text-error bg-errorLight';
	};

	if (compact) {
		// Minimal badge display (for lists)
		return (
			<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-extrabold leading-none sm:px-2.5 sm:py-1 sm:text-sm ${getColor()}`}>
				{score}
			</span>
		);
	}

	// Full badge display (with icon)
	return (
		<div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm sm:gap-2 sm:px-2.5 sm:text-xs md:text-sm">
			{showIcon && <ShieldCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />}
			<span className="truncate">Trust Score: {score}</span>
		</div>
	);
};

export default TrustBadge;
