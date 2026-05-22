export type UserRole =
	| "ROLE_USER"
	| "ROLE_ADMIN"
	| "ROLE_MODERATOR"
	| "ROLE_SUPER_ADMIN"
	| string;

export type AuthUser = {
	userId: number;
	name: string;
	email: string;
	status?: string;
	roles?: UserRole[];
	studentProfile?: StudentProfile | null;
};

export type StudentProfile = {
	studentId: string;
	phone: string;
	university?: string | null;
	department?: string | null;
	trustScore: number;
	emailVerified: boolean;
	phoneVerified: boolean;
};

export type CurrentUserResponse = {
	user: AuthUser;
	roles: UserRole[];
};

export type AuthResponse = CurrentUserResponse & {
	message: string;
	token: string;
};
