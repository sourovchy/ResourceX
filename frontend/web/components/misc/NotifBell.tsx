import React from "react";
import { Bell } from "lucide-react";

const NotifBell = ({ count }: { count?: number }) => {
	return (
		<button
			aria-label="Notifications"
			className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:h-10 sm:w-10">
			<Bell className="h-4 w-4 sm:h-5 sm:w-5" />

			{count && count > 0 && (
				<span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 sm:h-3 sm:w-3"></span>
			)}
		</button>
	);
};
export default NotifBell;
