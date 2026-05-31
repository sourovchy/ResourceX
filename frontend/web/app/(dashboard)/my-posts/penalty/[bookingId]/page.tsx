"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Penalties are issued by admins only after dispute resolution.
 * Owners who want to report damage should raise a Dispute instead.
 * This redirect ensures any bookmarked or linked URLs land in the right place.
 */
export default function PenaltyRequestRedirect() {
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
