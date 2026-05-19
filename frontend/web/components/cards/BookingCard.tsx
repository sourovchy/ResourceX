import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

const BookingCard = ({ title, status, date, location }: any) => {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<h3 className="font-semibold text-gray-800 text-lg">
					{title || "Item Booking"}
				</h3>
				<span
					className={`px-2.5 py-1 text-xs font-medium rounded-full ${
						status === "Active"
							? "bg-green-100 text-green-700"
							: "bg-gray-100 text-gray-700"
					}`}>
					{status || "Pending"}
				</span>
			</div>
			<div className="space-y-2 text-sm text-gray-600">
				<div className="flex items-center gap-2">
					<Calendar className="w-4 h-4 text-gray-400" />
					<span>{date || "Oct 24 - Oct 26"}</span>
				</div>
				<div className="flex items-center gap-2">
					<MapPin className="w-4 h-4 text-gray-400" />
					<span>{location || "Campus Center"}</span>
				</div>
			</div>
		</div>
	);
};
export default BookingCard;
