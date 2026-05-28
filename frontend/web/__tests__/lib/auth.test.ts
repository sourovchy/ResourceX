import { hasRole } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

describe("hasRole", () => {
	// ── Guards ───────────────────────────────────────────────────────────────

	it("returns false when roles is undefined", () => {
		expect(hasRole(undefined, "admin")).toBe(false);
	});

	it("returns false when roles is empty", () => {
		expect(hasRole([], "admin")).toBe(false);
	});

	// ── admin ─────────────────────────────────────────────────────────────────
	// ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MODERATOR"]

	it("recognises ROLE_ADMIN as admin", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "admin")).toBe(true);
	});

	it("recognises ROLE_SUPER_ADMIN as admin", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "admin")).toBe(true);
	});

	it("recognises ROLE_MODERATOR as admin", () => {
		expect(hasRole(["ROLE_MODERATOR"] as UserRole[], "admin")).toBe(true);
	});

	it("ROLE_USER is not admin", () => {
		expect(hasRole(["ROLE_USER"] as UserRole[], "admin")).toBe(false);
	});

	// ── super_admin ───────────────────────────────────────────────────────────

	it("recognises ROLE_SUPER_ADMIN as super_admin", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "super_admin")).toBe(true);
	});

	it("ROLE_ADMIN is not super_admin", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "super_admin")).toBe(false);
	});

	it("ROLE_MODERATOR is not super_admin", () => {
		expect(hasRole(["ROLE_MODERATOR"] as UserRole[], "super_admin")).toBe(false);
	});

	it("ROLE_USER is not super_admin", () => {
		expect(hasRole(["ROLE_USER"] as UserRole[], "super_admin")).toBe(false);
	});

	// ── moderator ─────────────────────────────────────────────────────────────
	// Implementation: ROLE_MODERATOR | ROLE_SUPER_ADMIN | ROLE_ADMIN all qualify

	it("recognises ROLE_MODERATOR as moderator", () => {
		expect(hasRole(["ROLE_MODERATOR"] as UserRole[], "moderator")).toBe(true);
	});

	it("recognises ROLE_SUPER_ADMIN as moderator", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "moderator")).toBe(true);
	});

	it("recognises ROLE_ADMIN as moderator", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "moderator")).toBe(true);
	});

	it("ROLE_USER is not moderator", () => {
		expect(hasRole(["ROLE_USER"] as UserRole[], "moderator")).toBe(false);
	});

	// ── student ───────────────────────────────────────────────────────────────
	// Any authenticated role qualifies (AUTHENTICATED_ROLES includes all four)

	it("recognises ROLE_USER as student", () => {
		expect(hasRole(["ROLE_USER"] as UserRole[], "student")).toBe(true);
	});

	it("recognises ROLE_ADMIN as student", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "student")).toBe(true);
	});

	it("recognises ROLE_MODERATOR as student", () => {
		expect(hasRole(["ROLE_MODERATOR"] as UserRole[], "student")).toBe(true);
	});

	it("recognises ROLE_SUPER_ADMIN as student", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "student")).toBe(true);
	});
});
