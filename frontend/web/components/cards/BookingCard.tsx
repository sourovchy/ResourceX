import React from "react";
import { Calendar, MapPin } from "lucide-react";

const BookingCard = ({ title, status, date, location }: any) => {
	return (
		<div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<h3 className="break-words pr-2 text-sm font-semibold leading-snug text-gray-800 sm:text-base md:text-lg">
					{title || "Item Booking"}
				</h3>
				<span
					className={`inline-flex max-w-full w-fit items-center rounded-full px-2 py-1 text-[10px] font-medium leading-none sm:px-2.5 sm:text-xs ${
						status === "Active"
							? "bg-green-100 text-green-700"
							: "bg-gray-100 text-gray-700"
					}`}>
					{status || "Pending"}
				</span>
			</div>
			<div className="space-y-2.5 text-xs text-gray-600 sm:text-sm">
				<div className="flex items-start gap-2">
					<Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
					<span className="min-w-0 break-words leading-relaxed">
						{date || "Oct 24 - Oct 26"}
					</span>
				</div>
				<div className="flex items-start gap-2">
					<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
					<span className="min-w-0 break-words leading-relaxed">
						{location || "Campus Center"}
					</span>
				</div>
			</div>
		</div>
	);
};
export default BookingCard;
