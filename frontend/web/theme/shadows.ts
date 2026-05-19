import { darkThemeColors, lightThemeColors } from "./colors";
const lightOutlineVariant = lightThemeColors.outlineVariant;
const darkOutlineVariant = darkThemeColors.outlineVariant;
export const shadows = {
	light: {
		level0: {
		},
		level1: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.08,
			shadowRadius: 2,
			elevation: 1,
		},
		level2: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 2,
		},
		level3: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.12,
			shadowRadius: 8,
			elevation: 3,
		},
		level4: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 8 },
			shadowOpacity: 0.14,
			shadowRadius: 12,
			elevation: 4,
		},
		level5: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 12 },
			shadowOpacity: 0.16,
			shadowRadius: 16,
			elevation: 5,
		},
	},
	dark: {
		level0: {
		},
		level1: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.04,
			shadowRadius: 2,
			elevation: 1,
			borderWidth: 1,
			borderColor: darkOutlineVariant,
		},
		level2: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 3,
			elevation: 2,
			borderWidth: 1,
			borderColor: darkOutlineVariant,
		},
		level3: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 3 },
			shadowOpacity: 0.06,
			shadowRadius: 6,
			elevation: 3,
			borderWidth: 1,
			borderColor: darkOutlineVariant,
		},
		level4: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.07,
			shadowRadius: 8,
			elevation: 4,
			borderWidth: 1,
			borderColor: darkOutlineVariant,
		},
		level5: {
			shadowColor: "#000000",
			shadowOffset: { width: 0, height: 8 },
			shadowOpacity: 0.08,
			shadowRadius: 10,
			elevation: 5,
			borderWidth: 1,
			borderColor: darkOutlineVariant,
		},
	},
	sm: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 2,
		elevation: 1,
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 3,
	},
	xl: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.14,
		shadowRadius: 12,
		elevation: 4,
	},
};
export const getShadow = (level: 0 | 1 | 2 | 3 | 4 | 5, isDarkMode = false) => {
	const themeShadows = isDarkMode ? shadows.dark : shadows.light;
	return themeShadows[`level${level}` as keyof typeof themeShadows];
};
export const componentShadows = {
	card: shadows.light.level1,
	cardHover: shadows.light.level2,
	floatingButton: shadows.light.level3,
	dialog: shadows.light.level4,
	modal: shadows.light.level5,
	navigationBar: shadows.light.level1,
	tabBar: shadows.light.level2,
};
