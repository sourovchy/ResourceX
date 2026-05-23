"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import api from "@/lib/api";
import {
	clearSession,
	getStoredToken,
	hasRole,
	storeSession,
} from "@/lib/auth";
import {
	AuthResponse,
	AuthUser,
	CurrentUserResponse,
	UserRole,
} from "@/types/auth";

type AccessibleRole = "admin" | "student" | "moderator" | "super_admin";

type AuthContextValue = {
	user: AuthUser | null;
	roles: UserRole[];
	loading: boolean;
	login: (
		email: string,
		password: string,
		redirect?: boolean,
	) => Promise<AuthResponse>;
	logout: () => void;
	refresh: () => Promise<void>;
	canAccess: (role: AccessibleRole) => boolean;
};

const AuthContext =
	createContext<AuthContextValue | undefined>(undefined);

function normalizeRoles(
	roles: UserRole[] = [],
): UserRole[] {
	return roles.map((role) =>
		String(role).toUpperCase() as UserRole,
	);
}

function getHomeRoute(roles: UserRole[]) {
	return roles.some((role) =>
		["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MODERATOR"].includes(role),
	)
		? "/home"
		: "/dashboard";
}

export function AuthProvider({
								 children,
							 }: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();

	const [user, setUser] = useState<AuthUser | null>(null);
	const [roles, setRoles] = useState<UserRole[]>([]);
	const [loading, setLoading] = useState(true);

	const suppressLoginRedirectRef = useRef(false);

	const applySession = useCallback(
		(token: string, nextUser: AuthUser, nextRoles: UserRole[]) => {
			const normalizedRoles = normalizeRoles(nextRoles);

			storeSession(token, nextUser, normalizedRoles);
			setUser(nextUser);
			setRoles(normalizedRoles);
		},
		[],
	);

	const logout = useCallback(() => {
		clearSession();
		setUser(null);
		setRoles([]);
		suppressLoginRedirectRef.current = false;
		router.replace("/auth/login");
	}, [router]);

	const refresh = useCallback(async () => {
		const token = getStoredToken();

		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const { data } = await api.get<CurrentUserResponse>("/auth/me");
			applySession(token, data.user, data.roles ?? []);
		} catch {
			clearSession();
			setUser(null);
			setRoles([]);
		} finally {
			setLoading(false);
		}
	}, [applySession]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		if (pathname !== "/auth/login") {
			suppressLoginRedirectRef.current = false;
		}
	}, [pathname]);

	const login = useCallback(
		async (
			email: string,
			password: string,
			redirect = true,
		) => {
			const { data } = await api.post<AuthResponse>("/auth/login", {
				email,
				password,
			});

			const normalizedRoles = normalizeRoles(data.roles ?? []);
			applySession(data.token, data.user, normalizedRoles);

			suppressLoginRedirectRef.current = !redirect;

			if (redirect) {
				router.replace(getHomeRoute(normalizedRoles));
			}

			return data;
		},
		[applySession, router],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			roles,
			loading,
			login,
			logout,
			refresh,
			canAccess: (role: AccessibleRole) => hasRole(roles, role),
		}),
		[user, roles, loading, login, logout, refresh],
	);

	useEffect(() => {
		if (
			!loading &&
			user &&
			pathname === "/auth/login" &&
			!suppressLoginRedirectRef.current
		) {
			router.replace(getHomeRoute(roles));
		}
	}, [loading, pathname, roles, router, user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
