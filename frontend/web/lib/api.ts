import axios from "axios";
import { clearSession, getStoredToken } from "@/lib/auth";

const api = axios.create({
	baseURL: "http://localhost:8082/api",
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

	const publicPaths = ["/auth/login", "/auth/register", "/otp/request", "/otp/resend", "/otp/verify"];
	const requestUrl = config.url ?? "";

	if (publicPaths.some((path) => requestUrl.startsWith(path))) {
		return config;
	}

	const token = getStoredToken();

	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (typeof window !== "undefined" && [401, 403].includes(error.response?.status)) {
			clearSession();
			window.location.href = "/auth/login";
		}

		return Promise.reject(error);
	},
);

export default api;
