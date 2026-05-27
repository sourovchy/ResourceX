import axios from "axios";
import { logger } from "@/lib/logger";

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8082/api";

const api = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Paths whose 401/403 errors are handled by their own callers (not the global redirect).
const SELF_HANDLED_PATHS = [
	"/auth/login",
	"/auth/register",
	"/auth/me",       // refresh() handles 401 — user is simply not logged in
	"/otp/request",
	"/otp/resend",
	"/otp/verify",
];

api.interceptors.response.use(
	(response) => {
		logger.debug(`[API Response] ${response.status} ${response.config.url}`);
		return response;
	},
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url ?? "";
		const data = error.response?.data;

		logger.error(`[API Error] ${status} ${url}`, {
			status,
			url,
			statusText: error.response?.statusText,
			data,
		});

		const isSelfHandled = SELF_HANDLED_PATHS.some((path) => url.startsWith(path));

		if (typeof window !== "undefined" && [401, 403].includes(status) && !isSelfHandled) {
			logger.warn(
				`[Auth Error] ${status} — clearing cookie and redirecting to login`,
			);
			fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(
				() => {},
			);
			window.location.href = "/auth/login";
		}

		return Promise.reject(error);
	},
);

export default api;
