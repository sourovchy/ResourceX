import React from "react";

const ResolveModal = ({ isOpen, onClose }: any) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				<div className="p-6">
					<h2 className="text-xl font-bold border-b pb-4 mb-4">
						Resolve Issue
					</h2>
					<p className="text-sm text-gray-600 mb-6">
						Are you sure you want to resolve this issue? This action cannot be
						undone.
					</p>
					<div className="flex justify-end gap-3">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
							Cancel
						</button>
						<button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
							Confirm
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ResolveModal;
