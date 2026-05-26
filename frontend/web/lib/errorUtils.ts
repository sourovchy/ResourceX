import axios from "axios";

export interface ApiErrorDetails {
	status: number;
	message: string;
	endpoint: string;
	timestamp: string;
}

export function extractErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		const data = error.response?.data;

		// Check if error response has a message field
		if (typeof data === "object" && data !== null && "message" in data) {
			return `Error ${status}: ${data.message}`;
		}

		// Check for array of error messages
		if (
			typeof data === "object" &&
			data !== null &&
			"errors" in data &&
			Array.isArray(data.errors) &&
			data.errors.length > 0
		) {
			return `Error ${status}: ${data.errors[0]}`;
		}

		// Generic status message
		if (status === 401) {
			return "Unauthorized. Please log in again.";
		}
		if (status === 403) {
			return "Access denied. You don't have permission to access this resource.";
		}
		if (status === 404) {
			return "Resource not found.";
		}
		if (status === 500) {
			return "Server error. Please try again later.";
		}

		return `Error ${status}: ${error.message}`;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}

export function logErrorDetails(
	error: unknown,
	context: {
		endpoint?: string;
		action?: string;
	},
): ApiErrorDetails {
	const details: ApiErrorDetails = {
		status: 0,
		message: "Unknown error",
		endpoint: context.endpoint || "unknown",
		timestamp: new Date().toISOString(),
	};

	if (axios.isAxiosError(error)) {
		details.status = error.response?.status || 0;
		details.message = extractErrorMessage(error);

		console.error(`[${context.action || "API Error"}] ${details.endpoint}`, {
			status: details.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		});
	} else {
		details.message = extractErrorMessage(error);
		console.error(`[${context.action || "Error"}] ${details.endpoint}`, error);
	}

	return details;
}
