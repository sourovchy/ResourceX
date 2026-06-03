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
	History,
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
	},
	{
		href: "/borrow",
		icon: ShoppingBag,
		label: "Borrow",
		roles: ["student"],
		subItems: [{ href: "/borrow/wishlist", label: "Wishlist", icon: Heart }],
	},
	{
		href: "/my-posts",
		icon: Archive,
		label: "My Posts",
		roles: ["student"],
		subItems: [
			{ href: "/my-posts/active-rentals", label: "Active Rentals", icon: PackageCheck },
			{ href: "/my-posts/requests", label: "Requests", icon: ClipboardList },
			{ href: "/my-posts/earnings", label: "Earnings", icon: Wallet },
			{ href: "/my-posts/deposit-tracker", label: "Deposits", icon: PiggyBank },
		],
	},
	{
		href: "/bookings",
		icon: Calendar,
		label: "Bookings",
	},
	{
		href: "/items",
		icon: Package,
		label: "Items",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/categories",
		icon: Tags,
		label: "Categories",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/inbox",
		icon: Inbox,
		label: "Inbox",
	},
	{
		href: "/disputes",
		icon: AlertTriangle,
		label: "Disputes",
		subItems: [
			{ href: "/disputes/my", label: "My Disputes", icon: FileText, roles: ["student"] },
			{ href: "/disputes/raise", label: "Raise Dispute", icon: FilePlus2, roles: ["student"] },
		],
	},
	{
		href: "/analytics",
		icon: BarChart3,
		label: "Analytics",
		roles: ["admin", "super_admin"],
	},
	{
		href: "/penalties",
		icon: ShieldAlert,
		label: "Penalties",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/trust-scores",
		icon: ShieldCheck,
		label: "Trust Scores",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/users",
		icon: Users,
		label: "Users",
		roles: ["admin", "super_admin"],
	},
	{
		href: "/staff-management",
		icon: UserCog,
		label: "Staff",
		roles: ["super_admin"],
	},
	{
		href: "/history",
		icon: History,
		label: "History",
		roles: ["student"],
	},
	{
		href: "/notifications",
		icon: Bell,
		label: "Notifications",
	},
	{
		href: "/profile",
		icon: User,
		label: "Profile",
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
