"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
	Shield,
	Users,
	UserPlus,
	Trash2,
	Loader2,
	RefreshCw,
	AlertCircle,
	ArrowUp,
	ArrowDown,
	Eye,
	EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type StaffRole = "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

type StaffMember = {
	id: string;
	name: string;
	email: string;
	role: StaffRole;
	createdAt?: string;
	status?: string;
};

type CreateStaffForm = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	role: StaffRole;
};

const initialForm: CreateStaffForm = {
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
	role: "ADMIN",
};

const roleLabel: Record<StaffRole, string> = {
	ADMIN: "Admin",
	MODERATOR: "Moderator",
	SUPER_ADMIN: "Super Admin",
};

const roleBadgeClass: Record<StaffRole, string> = {
	ADMIN: "bg-indigo-50 text-indigo-700",
	MODERATOR: "bg-slate-100 text-slate-700",
	SUPER_ADMIN: "bg-amber-50 text-amber-700",
};

export default function StaffManagementPage() {
	const [form, setForm] = useState<CreateStaffForm>(initialForm);
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [actionId, setActionId] = useState<string | null>(null);
	const [pageIndex, setPageIndex] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalStaff, setTotalStaff] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [confirmTarget, setConfirmTarget] = useState<{
		type: "remove" | "demote";
		member: StaffMember;
	} | null>(null);

	const passwordChecks = useMemo(
		() => [
			{ label: "At least 8 characters", valid: form.password.length >= 8 },
			{
				label: "Uppercase and lowercase letters",
				valid: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
			},
			{ label: "At least one number", valid: /\d/.test(form.password) },
			{ label: "At least one symbol", valid: /[^A-Za-z0-9]/.test(form.password) },
		],
		[form.password],
	);

	const passwordIsStrong = passwordChecks.every((check) => check.valid);

	const { user } = useAuth();
	const currentUserId = user?.userId ? String(user.userId) : null;

	const stats = useMemo(() => {
		// Since we have paginated data, we can't accurately count admins/moderators across all pages here.
		// We will just show the total staff count from the API.
		return { total: totalStaff };
	}, [totalStaff]);

	const normalizeMember = (member: any): StaffMember => {
		const roles: string[] = Array.isArray(member.roles) ? member.roles : [];
		const isSuperAdmin = roles.some((role) => role === "ROLE_SUPER_ADMIN");
		const isAdmin = roles.some((role) => role === "ROLE_ADMIN");

		return {
			id: String(member.userId ?? member.id ?? ""),
			name: member.name ?? "Unknown",
			email: member.email ?? "",
			role: isSuperAdmin ? "SUPER_ADMIN" : isAdmin ? "ADMIN" : "MODERATOR",
			status: String(member.status ?? "ACTIVE"),
			createdAt: member.createdAt ?? undefined,
		};
	};

	const loadStaff = useCallback(async (page: number) => {
		setError(null);
		setIsLoading(true);
		try {
			const response = await api.get(`/superadmin/privileged-users?page=${page}&size=10`);
			const payload = response.data;
			
			let members = [];
			if (payload?.data?.content) {
				members = payload.data.content;
				setTotalPages(payload.data.totalPages || 0);
				setTotalStaff(payload.data.totalElements || 0);
			} else if (Array.isArray(payload?.data)) {
				members = payload.data;
				setTotalPages(1);
				setTotalStaff(members.length);
			} else if (Array.isArray(payload)) {
			    members = payload;
			    setTotalPages(1);
			    setTotalStaff(members.length);
			}

			setStaff(members.map(normalizeMember));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to load staff members.",
			);
			setStaff([]);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		void loadStaff(pageIndex);
	}, [loadStaff, pageIndex]);

	const handleChange = (field: keyof CreateStaffForm, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleCreateStaff = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccess(null);

		if (!passwordIsStrong) {
			setError(
				"Use a stronger password with 8 characters, mixed letters, a number, and a symbol.",
			);
			return;
		}

		if (form.password.trim() !== form.confirmPassword.trim()) {
			setError("Passwords do not match.");
			setSuccess(null);
			return;
		}

		setIsSubmitting(true);

		try {
			const endpoint =
				form.role === "ADMIN" ? "/superadmin/admins" : "/superadmin/moderators";

			await api.post(endpoint, {
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
			});

			setSuccess(`${roleLabel[form.role]} account created successfully.`);
			setForm(initialForm);
			setShowPassword(false);
			setShowConfirmPassword(false);
			setPageIndex(0);
			await loadStaff(0);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to create staff account.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Opens the confirmation modal — actual work runs in executeRemoveStaff
	const handleRemoveStaff = (member: StaffMember) => {
		setConfirmTarget({ type: "remove", member });
	};

	const executeRemoveStaff = async (member: StaffMember) => {
		setError(null);
		setSuccess(null);
		setRemovingId(member.id);

		try {
			await api.delete(`/superadmin/privileged-users/${member.id}`);
			setSuccess(`${member.name} has been deleted successfully.`);
			await loadStaff(pageIndex);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to update staff account.",
			);
		} finally {
			setRemovingId(null);
		}
	};

	const handlePromoteStaff = async (member: StaffMember) => {
		setError(null);
		setSuccess(null);
		setActionId(member.id);

		try {
			await api.post(`/superadmin/promote-to-admin/${member.id}`);
			setSuccess(`${member.name} is now an admin.`);
			await loadStaff(pageIndex);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to promote staff account.",
			);
		} finally {
			setActionId(null);
		}
	};

	// Opens the confirmation modal — actual work runs in executeDemoteStaff
	const handleDemoteStaff = (member: StaffMember) => {
		setConfirmTarget({ type: "demote", member });
	};

	const executeDemoteStaff = async (member: StaffMember) => {
		setError(null);
		setSuccess(null);
		setActionId(member.id);

		try {
			await api.post(`/superadmin/demote-from-admin/${member.id}`);
			setSuccess(`${member.name} has been demoted to moderator.`);
			await loadStaff(pageIndex);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unable to demote staff account.",
			);
		} finally {
			setActionId(null);
		}
	};

	const handleConfirmAction = async () => {
		if (!confirmTarget) return;
		const { type, member } = confirmTarget;
		setConfirmTarget(null);
		if (type === "remove") {
			await executeRemoveStaff(member);
		} else {
			await executeDemoteStaff(member);
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadStaff(pageIndex);
	};

	return (
		<div className="w-full space-y-6 px-3 pb-16 sm:space-y-8 sm:px-6 lg:px-8">
			<ConfirmModal
				isOpen={confirmTarget !== null}
				isDestructive={confirmTarget?.type === "remove"}
				title={
					confirmTarget?.type === "remove"
						? "Delete Staff Account"
						: "Demote to Moderator"
				}
				message={
					confirmTarget?.type === "remove"
						? `Permanently delete the ${roleLabel[confirmTarget.member.role]} account for ${confirmTarget.member.name}? This cannot be undone.`
						: confirmTarget
							? `Demote ${confirmTarget.member.name} from Admin to Moderator? They will lose admin-level access immediately.`
							: ""
				}
				confirmText={confirmTarget?.type === "remove" ? "Delete" : "Demote"}
				cancelText="Cancel"
				isLoading={
					confirmTarget
						? removingId === confirmTarget.member.id ||
							actionId === confirmTarget.member.id
						: false
				}
				onConfirm={handleConfirmAction}
				onCancel={() => setConfirmTarget(null)}
			/>
			<div className="space-y-8">
				<section className="rounded-3xl border border-borderLight bg-surface p-6 shadow-sm">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-3xl">
							<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
								<Shield className="h-4 w-4" />
								Super Admin Control Panel
							</div>
							<h1 className="mt-4 text-3xl font-bold text-textPrimary tracking-tight">
								Staff Management
							</h1>
							<p className="mt-3 text-sm leading-6 text-textSecondary">
								Create and manage admin and moderator users from one secure
								interface.
							</p>
						</div>

						<div className="grid gap-3 text-center sm:grid-cols-2 lg:justify-items-end">
							<StatCard title="Total Staff" value={stats.total} />
						</div>
					</div>
				</section>

				{(error || success) && (
					<section className="space-y-3">
						{error && (
							<div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
								<AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
								<div className="text-sm font-medium">{error}</div>
							</div>
						)}
						{success && (
							<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
								{success}
							</div>
						)}
					</section>
				)}

				<div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
					<section className="rounded-3xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:self-start">
						<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-textPrimary">
									Create Staff Account
								</h2>
								<p className="mt-1 text-sm text-textSecondary">
									Add a new admin or moderator account.
								</p>
							</div>
							<div className="self-start rounded-2xl bg-primaryLight p-3 text-primary sm:self-auto">
								<UserPlus className="h-5 w-5" />
							</div>
						</div>

						<form className="space-y-4" onSubmit={handleCreateStaff}>
							<Field label="Full Name" htmlFor="name" required>
								<input
									id="name"
									value={form.name}
									onChange={(e) => {
										const sanitizedValue = e.target.value.replace(
											/[^A-Za-z. ]/g,
											"",
										);
										handleChange("name", sanitizedValue);
									}}
									placeholder="Md. Samiul Mirja Arif"
									className="h-11 w-full min-w-0 rounded-xl border border-borderLight bg-surface px-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
									required
									maxLength={100}
									pattern="^[A-Za-z]+(?:[. ]+[A-Za-z]+)*$"
									title="Only alphabets, spaces, and dots between words are allowed"
								/>
							</Field>

							<Field label="Email" htmlFor="email" required>
								<input
									id="email"
									type="email"
									value={form.email}
									onChange={(e) => handleChange("email", e.target.value)}
									placeholder="name@domain.com"
									className="h-11 w-full min-w-0 rounded-xl border border-borderLight bg-surface px-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
									required
								/>
							</Field>

							<div>
								<Field label="Password" htmlFor="password" required>
									<div className="relative">
										<input
											id="password"
											type={showPassword ? "text" : "password"}
											value={form.password}
											onChange={(e) => handleChange("password", e.target.value)}
											placeholder="Create a secure password"
											className="h-11 w-full min-w-0 rounded-xl border border-borderLight bg-surface px-4 pr-12 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
											required
											minLength={8}
										/>
										<button
											type="button"
											onClick={() => setShowPassword((v) => !v)}
											tabIndex={-1}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 text-textSecondary"
											aria-label={showPassword ? "Hide password" : "Show password"}
										>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</Field>
								<div className="space-y-2 rounded-2xl border border-borderLight bg-surfaceVariant px-4 py-4 text-sm">
									<p className="font-medium text-textPrimary">Password requirements</p>
									<ul className="space-y-1 text-textSecondary">
										{passwordChecks.map((check) => (
											<li key={check.label} className="flex items-center gap-2">
												<span
													className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
														check.valid
															? "bg-emerald-100 text-emerald-700"
															: "bg-slate-100 text-slate-400"
													}`}
												aria-hidden="true">
													{check.valid ? "✓" : "•"}
												</span>
												<span>{check.label}</span>
											</li>
										))}
									</ul>
								</div>
								<Field label="Confirm Password" htmlFor="confirmPassword" required>
									<div className="relative">
										<input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											value={form.confirmPassword}
											onChange={(e) => handleChange("confirmPassword", e.target.value)}
											placeholder="Re-enter password"
											className="h-11 w-full min-w-0 rounded-xl border border-borderLight bg-surface px-4 pr-12 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
											required
											minLength={8}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword((v) => !v)}
											tabIndex={-1}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 text-textSecondary"
											aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
										>
											{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</Field>
							</div>

							<Field label="Role" htmlFor="role" required>
								<select
									id="role"
									value={form.role}
									onChange={(e) => handleChange("role", e.target.value)}
									className="h-11 w-full min-w-0 rounded-xl border border-borderLight bg-surface px-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
									required>
									<option value="ADMIN">Admin</option>
									<option value="MODERATOR">Moderator</option>
								</select>
							</Field>

							<div className="rounded-2xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textSecondary">
								<p className="font-medium text-textPrimary">Permissions</p>
								<p className="mt-1 leading-6">
									Only Super Admin can create, delete, or manage privileged
									accounts.
								</p>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-onPrimary shadow-sm transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-70">
								{isSubmitting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<UserPlus className="h-4 w-4" />
								)}
								{isSubmitting ? "Creating Account..." : "Create Account"}
							</button>
						</form>
					</section>

					<section className="rounded-3xl border border-borderLight bg-card p-4 shadow-sm sm:p-6 min-w-0">
						<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-textPrimary">
									Existing Staff
								</h2>
								<p className="mt-1 text-sm text-textSecondary">
									Review current admin and moderator accounts. Super Admin can
									delete either role.
								</p>
							</div>

							<button
								type="button"
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="inline-flex items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2 text-sm font-medium text-textPrimary transition hover:bg-surfaceVariant disabled:cursor-not-allowed disabled:opacity-70">
								<RefreshCw
									className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
								/>
								Refresh
							</button>
						</div>

						<div className="overflow-x-auto rounded-2xl">
							<DataTable
								columns={[
									{
										header: "Member",
										cell: (member) => (
											<div className="min-w-0 max-w-full">
												<div className="font-medium text-textPrimary break-words">
													{member.name}
												</div>
												<div className="text-sm text-textSecondary break-all">
													{member.email}
												</div>
											</div>
										)
									},
									{
										header: "Role",
										cell: (member) => (
											<span
												className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleBadgeClass[member.role]}`}>
												{roleLabel[member.role]}
											</span>
										)
									},
									{
										header: "Status",
										cell: (member) => (
											<span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
												{member.status ?? "ACTIVE"}
											</span>
										)
									},
									{
										header: "Actions",
										cell: (member) => {
											const isSelfSuperAdmin = member.id === currentUserId && member.role === "SUPER_ADMIN";
											
											return (
												<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
													{isSelfSuperAdmin ? (
														<span className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed">
															Cannot delete self
														</span>
													) : (
														<button
															type="button"
															onClick={() => void handleRemoveStaff(member)}
															disabled={removingId === member.id}
															className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">
															{removingId === member.id ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="h-4 w-4" />
															)}
															Delete
														</button>
													)}
												</div>
											);
										}
									}
								]}
								data={staff}
								pageIndex={pageIndex}
								totalPages={totalPages}
								onPageChange={setPageIndex}
								isLoading={isLoading}
								emptyMessage="No staff accounts found"
								emptyDescription="Use the form to add the first admin or moderator account."
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

function Field({
	label,
	htmlFor,
	required,
	children,
}: {
	label: string;
	htmlFor: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<label htmlFor={htmlFor} className="block space-y-2">
			<div className="text-sm font-medium text-textTertiary">
				{label}
				{required ? <span className="ml-1 text-rose-500">*</span> : null}
			</div>
			{children}
		</label>
	);
}

function StatCard({ title, value }: { title: string; value: number }) {
	return (
		<div className="w-full rounded-2xl border border-borderLight bg-surfaceVariant px-4 py-4 text-left shadow-sm sm:min-w-[180px]">
			<div className="text-xs font-semibold uppercase tracking-[0.16em] text-textSecondary">
				{title}
			</div>
			<div className="mt-2 text-3xl font-bold leading-none text-textPrimary">
				{value}
			</div>
		</div>
	);
}

function Th({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<th
			className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-textSecondary sm:px-6 sm:py-4 ${className}`}>
			{children}
		</th>
	);
}

function Td({ children }: { children: React.ReactNode }) {
	return <td className="px-4 py-3 text-sm text-textPrimary sm:px-6 sm:py-4">{children}</td>;
}
