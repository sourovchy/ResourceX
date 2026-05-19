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
			<span className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${getColor()}`}>
				{score}
			</span>
		);
	}

	// Full badge display (with icon)
	return (
		<div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
			{showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
			<span>Trust Score: {score}</span>
		</div>
	);
};

export default TrustBadge;
