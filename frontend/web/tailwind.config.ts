import type { Config } from "tailwindcss";
import { lightThemeColors } from "./theme/colors";
import { typography } from "./theme/typography";
import { spacing } from "./theme/spacing";
import { radius } from "./theme/radius";
import { shadows } from "./theme/shadows";

const convertToString = (obj: any) =>
	Object.fromEntries(
		Object.entries(obj).map(([k, v]) => [
			k,
			typeof v === "number" ? `${v}px` : String(v),
		]),
	);

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
				...(convertToString(lightThemeColors) as any),
				// CSS-variable driven tokens so dark-mode overrides work via globals.css
				background: "var(--color-background)",
				surface: "var(--color-surface)",
				surfaceVariant: "var(--color-surfaceVariant)",
				card: "var(--color-card)",
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
			borderRadius: convertToString(radius) as any,
			boxShadow: convertToString(shadows) as any,
			spacing: convertToString(spacing) as any,
		},
	},
	plugins: [],
};
export default config;
