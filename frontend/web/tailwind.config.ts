import type { Config } from "tailwindcss";
import { lightThemeColors } from "./theme/colors";
import { typography } from "./theme/typography";
import { spacing } from "./theme/spacing";
import { radius } from "./theme/radius";
import { shadows } from "./theme/shadows";

const convertSpacing = (obj: any): any => {
	const result: any = {};
	for (const [k, v] of Object.entries(obj)) {
		if (typeof v === "number") {
			result[k] = `${v}px`;
		} else if (typeof v === "object" && v !== null) {
			result[k] = convertSpacing(v);
		} else {
			result[k] = String(v);
		}
	}
	return result;
};

const flattenShadows = (obj: any, prefix = ""): Record<string, string> => {
	const result: Record<string, string> = {};
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}-${k}` : k;
		if (typeof v === "object" && v !== null) {
			if ("shadowOffset" in v) {
				const width = (v as any).shadowOffset?.width || 0;
				const height = (v as any).shadowOffset?.height || 0;
				const radius = (v as any).shadowRadius || 0;
				const opacity = (v as any).shadowOpacity || 0.1;
				result[key] = `${width}px ${height}px ${radius}px rgba(0,0,0,${opacity})`;
			} else {
				Object.assign(result, flattenShadows(v, key));
			}
		}
	}
	return result;
};

const config: Config = {
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				...lightThemeColors,
				// CSS-variable driven tokens so dark-mode overrides work via globals.css
				background: "var(--color-background)",
				surface: "var(--color-surface)",
				surfaceVariant: "var(--color-surfaceVariant)",
				card: "var(--color-card)",
				popover: "var(--color-popover)",
				textPrimary: "var(--color-textPrimary)",
				textSecondary: "var(--color-textSecondary)",
				textTertiary: "var(--color-textTertiary)",
				border: "var(--color-border)",
				borderLight: "var(--color-borderLight)",
				outline: "var(--color-outline)",
				outlineVariant: "var(--color-outlineVariant)",
				divider: "var(--color-divider)",
				primary: "var(--color-primary)",
				primaryLight: "var(--color-primaryLight)",
				primaryDark: "var(--color-primaryDark)",
				onPrimary: "var(--color-onPrimary)",
				accent: "var(--color-accent)",
				accentLight: "var(--color-accentLight)",
				accentDark: "var(--color-accentDark)",
				success: "var(--color-success)",
				secondary: "var(--color-secondary)",
				successLight: "var(--color-successLight)",
				successDark: "var(--color-successDark)",
				error: "var(--color-error)",
				errorLight: "var(--color-errorLight)",
				errorDark: "var(--color-errorDark)",
				warning: "var(--color-warning)",
				warningLight: "var(--color-warningLight)",
				warningDark: "var(--color-warningDark)",
				onSurface: "var(--color-onSurface)",
			},
			borderRadius: convertSpacing(radius),
			boxShadow: flattenShadows(shadows),
			spacing: convertSpacing(spacing),
		},
	},
	plugins: [],
};
export default config;
