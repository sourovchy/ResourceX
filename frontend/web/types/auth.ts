export type UserRole = "ROLE_USER" | "ROLE_ADMIN" | string;

export type AuthUser = {
	userId: number;
	studentId: string;
	name: string;
	email: string;
	phone: string;
	university?: string;
	department?: string;
	trustScore?: number;
	emailVerified?: boolean;
	phoneVerified?: boolean;
	status?: string;
};

export type CurrentUserResponse = {
	user: AuthUser;
	roles: UserRole[];
};

export type AuthResponse = CurrentUserResponse & {
	message: string;
	token: string;
};
