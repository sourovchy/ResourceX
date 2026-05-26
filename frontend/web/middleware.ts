import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
	"/dashboard",
	"/bookings",
	"/disputes",
	"/analytics",
	"/items",
	"/users",
	"/categories",
	"/penalties",
	"/trust-scores",
	"/staff-management",
	"/notifications",
	"/profile",
	"/borrow",
	"/my-posts",
	"/inbox",
	"/history",
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("resourcex_token")?.value;

	const isProtectedRoute = PROTECTED_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if (isProtectedRoute && !token) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/bookings/:path*",
		"/disputes/:path*",
		"/analytics/:path*",
		"/items/:path*",
		"/users/:path*",
		"/categories/:path*",
		"/penalties/:path*",
		"/trust-scores/:path*",
		"/staff-management/:path*",
		"/notifications/:path*",
		"/profile/:path*",
		"/borrow/:path*",
		"/my-posts/:path*",
		"/inbox/:path*",
		"/history/:path*",
	],
};
