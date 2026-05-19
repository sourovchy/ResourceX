import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	return NextResponse.next();
}

export const config = {
	matcher: [], // Empty matcher means it won't actually run on any paths for now
};
