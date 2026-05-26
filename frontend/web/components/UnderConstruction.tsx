import React from "react";

export default function UnderConstruction() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-8">
			<div className="w-full max-w-sm rounded-xl border border-borderLight bg-surface p-6 text-center shadow-sm sm:max-w-md sm:p-8 lg:max-w-lg lg:p-10">
				<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-warningLight text-warning sm:mb-6 sm:h-16 sm:w-16">
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
				<h1 className="mb-2 text-xl font-bold text-textPrimary sm:text-2xl lg:text-3xl">
					Under Construction
				</h1>
				<p className="text-sm leading-relaxed text-textSecondary sm:text-base">
					We are currently working on this page. Please check back later.
				</p>
			</div>
		</div>
	);
}
