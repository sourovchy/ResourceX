import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STUDENT_PATHS = [
	"/dashboard",
	"/borrow",
	"/my-bookings",
	"/my-posts",
	"/inbox",
	"/disputes",
	"/notifications",
	"/profile",
	"/history",
];

const ADMIN_PATHS = [
	"/home",
	"/analytics",
	"/users",
	"/items",
	"/bookings",
	"/disputesAdmin",
	"/penalties",
	"/trust-scores",
	"/categories",
	"/announcements",
	"/adminProfile",
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("resourcex_token")?.value;
	const encodedRoles = request.cookies.get("resourcex_roles")?.value;
	const roles = encodedRoles ? decodeURIComponent(encodedRoles) : "[]";

	const isStudentRoute = STUDENT_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);
	const isAdminRoute = ADMIN_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if ((isStudentRoute || isAdminRoute) && !token) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	if (isAdminRoute && !roles.includes("ROLE_ADMIN")) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/borrow/:path*",
		"/my-bookings/:path*",
		"/my-posts/:path*",
		"/inbox/:path*",
		"/disputes/:path*",
		"/notifications/:path*",
		"/profile/:path*",
		"/history/:path*",
		"/home/:path*",
		"/analytics/:path*",
		"/users/:path*",
		"/items/:path*",
		"/bookings/:path*",
		"/disputesAdmin/:path*",
		"/penalties/:path*",
		"/trust-scores/:path*",
		"/categories/:path*",
		"/announcements/:path*",
		"/adminProfile/:path*",
	],
};
