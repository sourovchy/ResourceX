export type PasswordCheck = {
	label: string;
	valid: boolean;
};

export function validatePasswordChecks(password: string): PasswordCheck[] {
	return [
		{ label: "At least 8 characters", valid: password.length >= 8 },
		{ label: "Uppercase letter", valid: /[A-Z]/.test(password) },
		{ label: "Lowercase letter", valid: /[a-z]/.test(password) },
		{ label: "At least one number", valid: /\d/.test(password) },
		{ label: "At least one symbol", valid: /[^A-Za-z0-9]/.test(password) },
	];
}

export function isPasswordStrong(password: string): boolean {
	return validatePasswordChecks(password).every((check) => check.valid);
}

export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
	// Matches +8801... or 01... formats for Bangladesh
	return /^(?:\+8801|01)[3-9]\d{8}$/.test(phone);
}

export function normalizePhone(phone: string): string {
	if (!phone) return "";
	const cleaned = phone.replace(/[\s-]/g, "");
	if (cleaned.startsWith("01")) {
		return `+88${cleaned}`;
	}
	return cleaned;
}

export function validateStudentId(studentId: string): boolean {
	// Let's assume alphanumeric string, at least 5 and up to 20 chars
	return /^[A-Za-z0-9]{5,20}$/.test(studentId);
}
