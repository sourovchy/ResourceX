import axios from "axios";

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

	const token = localStorage.getItem("campusvault_token");

	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export default api;
