import { UserRole } from "@/types/auth";
import { logger } from "@/lib/logger";

export type AccessibleRole = "admin" | "student" | "moderator" | "super_admin";

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

/** No-op: JWT is stored in an httpOnly cookie set by the backend. */
export function storeSession() {
	logger.debug("[Auth] Session established via httpOnly cookie");
}

/** No-op: session cookie is cleared by POST /auth/logout on the backend. */
export function clearSession() {
	logger.debug("[Auth] clearSession called — cookie cleared by backend logout");
}

export function hasRole(roles: UserRole[] | undefined, role: AccessibleRole) {
	if (!roles || roles.length === 0) {
		logger.debug("[Auth] No roles available for hasRole check");
		return false;
	}

	logger.debug(`[Auth] Checking role "${role}" against user roles:`, roles);

	if (role === "admin") {
		return roles.some((value) => ADMIN_ROLES.includes(value));
	} else if (role === "super_admin") {
		return roles.includes("ROLE_SUPER_ADMIN");
	} else if (role === "moderator") {
		return roles.some((value) =>
			["ROLE_MODERATOR", "ROLE_SUPER_ADMIN", "ROLE_ADMIN"].includes(value),
		);
	} else if (role === "student") {
		return roles.some((value) => AUTHENTICATED_ROLES.includes(value));
	}

	return roles.some((value) => AUTHENTICATED_ROLES.includes(value));
}
