export function formatShortDate(date: string | Date | null | undefined): string {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateRange(
	start: string | null | undefined,
	end: string | null | undefined,
): string {
	const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
	const s = start && !isNaN(new Date(start).getTime()) ? new Date(start).toLocaleDateString("en-US", opts) : "?";
	const e = end && !isNaN(new Date(end).getTime()) ? new Date(end).toLocaleDateString("en-US", opts) : "?";
	return `${s} – ${e}`;
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "—";
	const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	return formatShortDate(d);
}
