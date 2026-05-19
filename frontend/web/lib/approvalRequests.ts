export type ApprovalRequest = {
	id: string;
	name: string;
	email: string;
	phone: string;
	studentId: string;
	university: string;
	department: string;
	idCardFileName: string;
	idCardDataUrl: string;
	status: "PENDING" | "VERIFIED" | "REJECTED";
	submittedAt: string;
};

const REQUESTS_KEY = "campusvault_approval_requests";
const CURRENT_REQUEST_KEY = "campusvault_current_approval_request_id";

export function getApprovalRequests() {
	if (typeof window === "undefined") {
		return [] as ApprovalRequest[];
	}

	try {
		const raw = localStorage.getItem(REQUESTS_KEY);
		return raw ? (JSON.parse(raw) as ApprovalRequest[]) : [];
	} catch {
		return [];
	}
}

export function saveApprovalRequest(request: ApprovalRequest) {
	if (typeof window === "undefined") {
		return;
	}

	const existing = getApprovalRequests().filter((item) => item.id !== request.id);
	localStorage.setItem(REQUESTS_KEY, JSON.stringify([request, ...existing]));
	localStorage.setItem(CURRENT_REQUEST_KEY, request.id);
}

export function getCurrentApprovalRequest() {
	if (typeof window === "undefined") {
		return null;
	}

	const currentId = localStorage.getItem(CURRENT_REQUEST_KEY);

	if (!currentId) {
		return null;
	}

	return getApprovalRequests().find((item) => item.id === currentId) ?? null;
}

export function formatSubmittedAt(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
