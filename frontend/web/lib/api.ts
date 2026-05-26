import axios from "axios";
import { clearSession, getStoredToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

const api = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
		"http://localhost:8082/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.request.use((config) => {
	if (typeof window === "undefined") {
		return config;
	}

	const publicPaths = [
		"/auth/login",
		"/auth/register",
		"/otp/request",
		"/otp/resend",
		"/otp/verify",
	];
	const requestUrl = config.url ?? "";

	if (publicPaths.some((path) => requestUrl.startsWith(path))) {
		return config;
	}

	const token = getStoredToken();

	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
		logger.debug(
			`[API Request] ${config.method?.toUpperCase()} ${requestUrl} - Token attached`,
		);
	} else if (!publicPaths.some((path) => requestUrl.startsWith(path))) {
		logger.warn(
			`[API Warning] No token found for protected endpoint: ${config.method?.toUpperCase()} ${requestUrl}`,
		);
	}

	return config;
});

api.interceptors.response.use(
	(response) => {
		logger.debug(`[API Response] ${response.status} ${response.config.url}`);
		return response;
	},
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url;
		const data = error.response?.data;

		logger.error(`[API Error] ${status} ${url}`, {
			status,
			url,
			statusText: error.response?.statusText,
			data,
		});

		const publicPaths = [
			"/auth/login",
			"/auth/register",
			"/otp/request",
			"/otp/resend",
			"/otp/verify",
		];
		const isPublicRequest = url && publicPaths.some((path) => url.startsWith(path));

		if (typeof window !== "undefined" && [401, 403].includes(status) && !isPublicRequest) {
			logger.warn(
				`[Auth Error] ${status} - Clearing session and redirecting to login`,
			);
			clearSession();
			window.location.href = "/auth/login";
		}

		return Promise.reject(error);
	},
);

export default api;
