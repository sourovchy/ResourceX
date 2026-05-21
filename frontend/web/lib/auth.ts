import { AuthUser, UserRole } from "@/types/auth";

export const AUTH_TOKEN_KEY = "resourcex_token";
export const AUTH_USER_KEY = "resourcex_user";
export const AUTH_ROLES_KEY = "resourcex_roles";
export const PENDING_EMAIL_KEY = "resourcex_pending_email";
export const OTP_LAST_SEND_KEY = "resourcex_otp_last_send";

export function getStoredToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeSession(token: string, user: AuthUser, roles: UserRole[] = []) {
	localStorage.setItem(AUTH_TOKEN_KEY, token);
	localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
	localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(roles));

	document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
	document.cookie = `${AUTH_ROLES_KEY}=${encodeURIComponent(JSON.stringify(roles))}; path=/; max-age=86400; SameSite=Lax`;

}

export function clearSession() {
	if (typeof window !== "undefined") {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		localStorage.removeItem(AUTH_ROLES_KEY);

	}

	for (const key of [AUTH_TOKEN_KEY, AUTH_ROLES_KEY]) {
		document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
	}
}

export function hasRole(roles: UserRole[] | undefined, role: "admin" | "student") {
	if (!roles) return false;
	return role === "admin"
		? roles.includes("ROLE_ADMIN")
		: roles.includes("ROLE_USER") || roles.includes("ROLE_ADMIN");
}
