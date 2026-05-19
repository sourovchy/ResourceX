import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8082/api",
});

api.interceptors.request.use((config) => {
	if (typeof window === "undefined") {
		return config;
	}

	const token = localStorage.getItem("campusvault_token");

	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export default api;
