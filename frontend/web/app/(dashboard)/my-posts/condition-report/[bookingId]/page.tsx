"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Condition reports are handled through the Disputes system.
 * This redirect ensures any bookmarked or linked URLs land in the right place.
 */
export default function ConditionReportRedirect() {
	const router = useRouter();
	const params = useParams();
	const bookingId = params?.bookingId as string;

	useEffect(() => {
		router.replace(
			bookingId
				? `/disputes/raise?bookingId=${bookingId}`
				: "/disputes/raise",
		);
	}, [bookingId, router]);

	return null;
}
