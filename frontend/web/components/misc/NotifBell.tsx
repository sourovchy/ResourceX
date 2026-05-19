import React from "react";
import { Bell } from "lucide-react";

const NotifBell = ({ count }: { count?: number }) => {
	return (
		<button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
			<Bell className="w-5 h-5" />
			{count && count > 0 && (
				<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
			)}
		</button>
	);
};
export default NotifBell;
