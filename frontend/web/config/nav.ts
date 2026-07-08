import {
	LayoutDashboard,
	ShoppingBag,
	Inbox,
	AlertTriangle,
	Bell,
	User,
	Archive,
	Calendar,
	BarChart3,
	Users,
	Package,
	Tags,
	ShieldAlert,
	ShieldCheck,
	UserCog,
	// sub-item icons
	Heart,
	PackageCheck,
	ClipboardList,
	Wallet,
	PiggyBank,
	FileText,
	FilePlus2,
	type LucideIcon,
} from "lucide-react";
import { type AccessibleRole } from "@/lib/auth";

export type NavGroup = "Dashboard" | "Resource Management" | "Communication" | "Account" | "System";

export type NavSubItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	/** If omitted, inherits visibility from the parent item. */
	roles?: AccessibleRole[];
};

export type NavItem = {
	href: string;
	icon: LucideIcon;
	label: string;
	/** If undefined, accessible by all authenticated roles. */
	roles?: AccessibleRole[];
	subItems?: NavSubItem[];
	group: NavGroup;
};

/**
 * Single source of truth for the dashboard sidebar.
 *
 * To add a section: append a `NavItem`. To add a nested page: push a
 * `NavSubItem` (with its own icon) into the parent's `subItems`. The sidebar
 * renders entirely from this config — no JSX changes required.
 */
export const DASHBOARD_NAV: NavItem[] = [
	{
		href: "/dashboard",
		icon: LayoutDashboard,
		label: "Dashboard",
		group: "Dashboard",
	},
	{
		href: "/analytics",
		icon: BarChart3,
		label: "Analytics",
		roles: ["admin", "super_admin"],
		group: "Dashboard",
	},
	{
		href: "/borrow",
		icon: ShoppingBag,
		label: "Borrow",
		roles: ["student"],
		subItems: [{ href: "/borrow/wishlist", label: "Wishlist", icon: Heart }],
		group: "Resource Management",
	},
	{
		href: "/my-posts",
		icon: Archive,
		label: "My Posts",
		roles: ["student"],
		subItems: [
			{ href: "/my-posts/active-rentals", label: "Active Rentals", icon: PackageCheck },
			{ href: "/my-posts/requests", label: "Requests", icon: ClipboardList },
		],
		group: "Resource Management",
	},
	{
		href: "/bookings",
		icon: Calendar,
		label: "Bookings",
		group: "Resource Management",
	},
	{
		href: "/items",
		icon: Package,
		label: "Items",
		roles: ["admin", "super_admin", "moderator"],
		group: "Resource Management",
	},
	{
		href: "/categories",
		icon: Tags,
		label: "Categories",
		roles: ["admin", "super_admin", "moderator"],
		group: "Resource Management",
	},
	{
		href: "/inbox",
		icon: Inbox,
		label: "Inbox",
		group: "Communication",
	},
	{
		href: "/notifications",
		icon: Bell,
		label: "Notifications",
		group: "Communication",
	},

	{
		href: "/moderation",
		icon: AlertTriangle,
		label: "Moderation",
		roles: ["admin", "super_admin", "moderator"],
		group: "System",
	},
	{
		href: "/users",
		icon: Users,
		label: "Users",
		roles: ["admin", "super_admin"],
		group: "System",
	},
	{
		href: "/staff-management",
		icon: UserCog,
		label: "Staff",
		roles: ["super_admin"],
		group: "System",
	},

];

/**
 * Filters the nav tree to the items/sub-items visible to a given role.
 * A parent whose sub-items all get filtered out keeps rendering as a plain link.
 */
export function getNavForRole(role: AccessibleRole | null): NavItem[] {
	if (!role) return [];

	return DASHBOARD_NAV.filter(
		(item) => !item.roles || item.roles.length === 0 || item.roles.includes(role),
	).map((item) => {
		if (!item.subItems) return item;

		const validSubItems = item.subItems.filter(
			(sub) => !sub.roles || sub.roles.length === 0 || sub.roles.includes(role),
		);

		if (validSubItems.length === 0) {
			const { subItems, ...rest } = item;
			return rest;
		}
		return { ...item, subItems: validSubItems };
	});
}
