import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PATHS = [
	"/dashboard",
	"/bookings",
	"/disputes",
	"/analytics",
	"/items",
	"/users",
	"/categories",
	"/penalties",
	"/staff-management",
	"/notifications",
	"/profile",
	"/borrow",
	"/my-posts",
	"/inbox",
];

// Same HS512 secret and key derivation (raw UTF-8 bytes) as backend JwtService —
// this only re-validates signature/expiry to gate the page shell server-side;
// the backend is still the source of truth for every actual data request.
const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

async function isValidToken(token: string): Promise<boolean> {
	if (!secretKey) return true; // misconfigured env — don't hard-lock every route out
	try {
		await jwtVerify(token, secretKey, { algorithms: ["HS512"] });
		return true;
	} catch {
		return false;
	}
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("resourcex_token")?.value;

	const isProtectedRoute = PROTECTED_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if (!isProtectedRoute) {
		return NextResponse.next();
	}

	if (!token || !(await isValidToken(token))) {
		const response = NextResponse.redirect(new URL("/auth/login", request.url));
		if (token) {
			response.cookies.delete("resourcex_token");
		}
		return response;
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
		"/staff-management/:path*",
		"/notifications/:path*",
		"/profile/:path*",
		"/borrow/:path*",
		"/my-posts/:path*",
		"/inbox/:path*",
	],
};
