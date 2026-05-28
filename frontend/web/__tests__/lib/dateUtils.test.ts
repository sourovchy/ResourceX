import { formatShortDate, formatDateRange, formatRelativeTime } from "@/lib/dateUtils";

describe("formatShortDate", () => {
	it("returns — for null", () => expect(formatShortDate(null)).toBe("—"));
	it("returns — for undefined", () => expect(formatShortDate(undefined)).toBe("—"));
	it("returns — for invalid string", () => expect(formatShortDate("not-a-date")).toBe("—"));

	it("formats a valid ISO date string", () => {
		const result = formatShortDate("2026-01-15");
		expect(result).toMatch(/Jan/);
		expect(result).toMatch(/15/);
		expect(result).toMatch(/2026/);
	});

	it("formats a Date object", () => {
		const result = formatShortDate(new Date(2026, 0, 15));
		expect(result).toMatch(/Jan/);
	});
});

describe("formatDateRange", () => {
	it("handles both null", () => {
		const result = formatDateRange(null, null);
		expect(result).toBe("? – ?");
	});

	it("formats a valid range", () => {
		const result = formatDateRange("2026-05-01", "2026-05-07");
		expect(result).toContain("May 1");
		expect(result).toContain("May 7");
		expect(result).toContain("–");
	});
});

describe("formatRelativeTime", () => {
	it("returns — for null", () => expect(formatRelativeTime(null)).toBe("—"));

	it("returns Today for today", () => {
		expect(formatRelativeTime(new Date())).toBe("Today");
	});

	it("returns Yesterday for yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(formatRelativeTime(yesterday)).toBe("Yesterday");
	});

	it("returns N days ago for recent dates", () => {
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
		expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
	});
});
