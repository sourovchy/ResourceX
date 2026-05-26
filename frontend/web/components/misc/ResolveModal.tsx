import React from "react";

const ResolveModal = ({ isOpen, onClose }: any) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 sm:max-w-md">
				<div className="border-b border-gray-100 p-5 sm:p-6">
					<h2 className="text-lg font-bold text-gray-900 sm:text-xl">
						Resolve Issue
					</h2>
				</div>

				<div className="space-y-5 p-5 sm:p-6">
					<p className="text-sm leading-relaxed text-gray-600 sm:text-base">
						Are you sure you want to resolve this issue? This action cannot be
						undone.
					</p>

					<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						<button
							onClick={onClose}
							className="inline-flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto">
							Cancel
						</button>
						<button className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto">
							Confirm
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResolveModal;
