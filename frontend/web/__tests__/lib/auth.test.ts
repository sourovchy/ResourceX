import { hasRole } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

describe("hasRole", () => {
	it("returns false when roles is undefined", () => {
		expect(hasRole(undefined, "admin")).toBe(false);
	});

	it("returns false when roles is empty", () => {
		expect(hasRole([], "admin")).toBe(false);
	});

	it("recognises ROLE_ADMIN as admin", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "admin")).toBe(true);
	});

	it("recognises ROLE_SUPER_ADMIN as admin", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "admin")).toBe(true);
	});

	it("ROLE_STUDENT is not admin", () => {
		expect(hasRole(["ROLE_STUDENT"] as UserRole[], "admin")).toBe(false);
	});

	it("recognises ROLE_SUPER_ADMIN as super_admin", () => {
		expect(hasRole(["ROLE_SUPER_ADMIN"] as UserRole[], "super_admin")).toBe(true);
	});

	it("ROLE_ADMIN is not super_admin", () => {
		expect(hasRole(["ROLE_ADMIN"] as UserRole[], "super_admin")).toBe(false);
	});

	it("recognises ROLE_MODERATOR as moderator", () => {
		expect(hasRole(["ROLE_MODERATOR"] as UserRole[], "moderator")).toBe(true);
	});

	it("recognises ROLE_USER as student", () => {
		expect(hasRole(["ROLE_USER"] as UserRole[], "student")).toBe(true);
	});
});
