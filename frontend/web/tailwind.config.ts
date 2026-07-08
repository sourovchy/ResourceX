import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { lightThemeColors } from "./theme/colors";
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
			screens: {
				xs: "480px",
			},
			colors: {
				...lightThemeColors,
				// CSS-variable driven tokens so dark-mode overrides work via globals.css
				background: "rgb(var(--color-background) / <alpha-value>)",
				surface: "rgb(var(--color-surface) / <alpha-value>)",
				surfaceVariant: "rgb(var(--color-surfaceVariant) / <alpha-value>)",
				card: "rgb(var(--color-card) / <alpha-value>)",
				popover: "rgb(var(--color-popover) / <alpha-value>)",
				textPrimary: "rgb(var(--color-textPrimary) / <alpha-value>)",
				textSecondary: "rgb(var(--color-textSecondary) / <alpha-value>)",
				textTertiary: "rgb(var(--color-textTertiary) / <alpha-value>)",
				border: "rgb(var(--color-border) / <alpha-value>)",
				borderLight: "rgb(var(--color-borderLight) / <alpha-value>)",
				outline: "rgb(var(--color-outline) / <alpha-value>)",
				outlineVariant: "rgb(var(--color-outlineVariant) / <alpha-value>)",
				divider: "rgb(var(--color-divider) / <alpha-value>)",
				primary: "rgb(var(--color-primary) / <alpha-value>)",
				primaryLight: "rgb(var(--color-primaryLight) / <alpha-value>)",
				primaryDark: "rgb(var(--color-primaryDark) / <alpha-value>)",
				onPrimary: "rgb(var(--color-onPrimary) / <alpha-value>)",
				accent: "rgb(var(--color-accent) / <alpha-value>)",
				accentLight: "rgb(var(--color-accentLight) / <alpha-value>)",
				accentDark: "rgb(var(--color-accentDark) / <alpha-value>)",
				success: "rgb(var(--color-success) / <alpha-value>)",
				secondary: "rgb(var(--color-secondary) / <alpha-value>)",
				successLight: "rgb(var(--color-successLight) / <alpha-value>)",
				successDark: "rgb(var(--color-successDark) / <alpha-value>)",
				error: "rgb(var(--color-error) / <alpha-value>)",
				errorLight: "rgb(var(--color-errorLight) / <alpha-value>)",
				errorDark: "rgb(var(--color-errorDark) / <alpha-value>)",
				warning: "rgb(var(--color-warning) / <alpha-value>)",
				warningLight: "rgb(var(--color-warningLight) / <alpha-value>)",
				warningDark: "rgb(var(--color-warningDark) / <alpha-value>)",
				onSurface: "rgb(var(--color-onSurface) / <alpha-value>)",
			},
			fontFamily: {
				sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
			},
			borderRadius: convertSpacing(radius),
			boxShadow: flattenShadows(shadows),
			spacing: convertSpacing(spacing),
		},
	},
	plugins: [tailwindcssAnimate],
};
export default config;
