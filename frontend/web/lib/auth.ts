import { AuthUser, UserRole } from "@/types/auth";

export const AUTH_TOKEN_KEY = "resourcex_token";
export const AUTH_USER_KEY = "resourcex_user";
export const AUTH_ROLES_KEY = "resourcex_roles";
export const PENDING_EMAIL_KEY = "resourcex_pending_email";
export const OTP_LAST_SEND_KEY = "resourcex_otp_last_send";

const ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MODERATOR"];
const AUTHENTICATED_ROLES = ["ROLE_USER", ...ADMIN_ROLES];

export function getOtpLastSendTimestamp() {
	if (typeof window === "undefined") return null;
	const value = localStorage.getItem(OTP_LAST_SEND_KEY);
	return value ? Number(value) : null;
}

export function setOtpLastSendTimestamp(timestamp: number) {
	if (typeof window === "undefined") return;
	localStorage.setItem(OTP_LAST_SEND_KEY, timestamp.toString());
}

export function clearOtpLastSendTimestamp() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(OTP_LAST_SEND_KEY);
}

export function getStoredToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeSession(
	token: string,
	user: AuthUser,
	roles: UserRole[] = [],
) {
	const userWithRoles = roles.length ? { ...user, roles } : user;
	localStorage.setItem(AUTH_TOKEN_KEY, token);
	localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userWithRoles));
	localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(roles));

	document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSession() {
	if (typeof window === "undefined") return;

	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_USER_KEY);
	localStorage.removeItem(AUTH_ROLES_KEY);
	for (const key of [AUTH_TOKEN_KEY, AUTH_ROLES_KEY]) {
		document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
	}
}

export function hasRole(roles: UserRole[] | undefined, role: AccessibleRole) {
	if (!roles) return false;
	return role === "admin"
		? roles.some((value) => ADMIN_ROLES.includes(value))
		: roles.some((value) => AUTHENTICATED_ROLES.includes(value));
}
