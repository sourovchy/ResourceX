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
	type AccessibleRole,
} from "@/lib/auth";
import {
	AuthResponse,
	AuthUser,
	CurrentUserResponse,
	UserRole,
} from "@/types/auth";

type AuthContextValue = {
	user: AuthUser | null;
	roles: UserRole[];
	loading: boolean;
	error: string | null;
	login: (
		email: string,
		password: string,
		redirect?: boolean,
	) => Promise<AuthResponse>;
	logout: () => void;
	refresh: () => Promise<void>;
	canAccess: (role: AccessibleRole) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRoles(roles: UserRole[] = []): UserRole[] {
	return Array.from(
		new Set(
			roles
				.filter(Boolean)
				.map((role) => String(role).trim().toUpperCase() as UserRole),
		),
	);
}

function getHomeRoute(_roles: UserRole[]) {
	// Replace this with role-specific routes if needed.
	return "/dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const [user, setUser] = useState<AuthUser | null>(null);
	const [roles, setRoles] = useState<UserRole[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const suppressLoginRedirectRef = useRef(false);
	const isMountedRef = useRef(true);
	const requestSeqRef = useRef(0);

	const nextRequestSeq = useCallback(() => {
		requestSeqRef.current += 1;
		return requestSeqRef.current;
	}, []);

	const applySession = useCallback(
		(token: string, nextUser: AuthUser, nextRoles: UserRole[]) => {
			const normalizedRoles = normalizeRoles(nextRoles);

			storeSession(token, nextUser, normalizedRoles);
			setUser(nextUser);
			setRoles(normalizedRoles);
			setError(null);
		},
		[],
	);

	const logout = useCallback(() => {
		nextRequestSeq(); // invalidate any in-flight refresh/login result
		clearSession();
		setUser(null);
		setRoles([]);
		setError(null);
		suppressLoginRedirectRef.current = false;

		if (pathname !== "/auth/login") {
			router.replace("/auth/login");
		}
	}, [nextRequestSeq, pathname, router]);

	const refresh = useCallback(async () => {
		const seq = nextRequestSeq();
		const token = getStoredToken();

		if (!token) {
			clearSession();
			if (isMountedRef.current && seq === requestSeqRef.current) {
				setUser(null);
				setRoles([]);
				setError(null);
				setLoading(false);
			}
			return;
		}

		try {
			const { data } = await api.get<CurrentUserResponse>("/auth/me");

			if (isMountedRef.current && seq === requestSeqRef.current) {
				applySession(token, data.user, data.roles ?? []);
			}
		} catch (err) {
			clearSession();

			if (isMountedRef.current && seq === requestSeqRef.current) {
				setUser(null);
				setRoles([]);
				setError("Failed to restore session");
			}
		} finally {
			if (isMountedRef.current && seq === requestSeqRef.current) {
				setLoading(false);
			}
		}
	}, [applySession, nextRequestSeq]);

	useEffect(() => {
		isMountedRef.current = true;
		void refresh();

		return () => {
			isMountedRef.current = false;
		};
	}, [refresh]);

	useEffect(() => {
		if (pathname !== "/auth/login") {
			suppressLoginRedirectRef.current = false;
		}
	}, [pathname]);

	const login = useCallback(
		async (email: string, password: string, redirect = true) => {
			const seq = nextRequestSeq();

			try {
				const { data } = await api.post<AuthResponse>("/auth/login", {
					email,
					password,
				});

				if (!isMountedRef.current || seq !== requestSeqRef.current) {
					return data;
				}

				const normalizedRoles = normalizeRoles(data.roles ?? []);
				applySession(data.token, data.user, normalizedRoles);

				suppressLoginRedirectRef.current = !redirect;
				setError(null);

				if (redirect) {
					router.replace(getHomeRoute(normalizedRoles));
				}

				return data;
			} catch (err) {
				if (isMountedRef.current && seq === requestSeqRef.current) {
					setError("Login failed");
				}
				throw err;
			}
		},
		[applySession, nextRequestSeq, router],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			roles,
			loading,
			error,
			login,
			logout,
			refresh,
			canAccess: (role: AccessibleRole) => hasRole(roles, role),
		}),
		[user, roles, loading, error, login, logout, refresh],
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