import React from "react";

export default function UnderConstruction() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
			<div className="p-8 bg-surface border border-borderLight rounded-xl shadow-sm text-center max-w-md w-full">
				<div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-warningLight text-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round">
						<path d="M12 2v20" />
						<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				<h1 className="text-2xl font-bold text-textPrimary mb-2">
					Under Construction
				</h1>
				<p className="text-textSecondary">
					We are currently working on this page. Please check back later.
				</p>
			</div>
		</div>
	);
}
