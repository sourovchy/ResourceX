export const borderRadius = {
	none: 0, // 0px - Square corners
	xs: 4, // 4px - Slight rounding
	sm: 8, // 8px - Small elements
	md: 12, // 12px - Cards, inputs
	lg: 16, // 16px - Large cards
	xl: 20, // 20px - Sheets, dialogs
	"2xl": 24, // 24px - Bottom sheets
	"3xl": 28, // 28px - Special elements
	full: 9999, // 9999px - Circular/pill
	component: {
		button: 100, // Fully rounded (pill shape)
		buttonSmall: 8, // Small button radius
		card: 12,
		cardLarge: 16,
		input: {
			outlined: 8,
			filled: 4,
		},
		chip: 8,
		badge: 9999,
		dialog: 28,
		bottomSheet: {
			top: 28, // Top corners only
			bottom: 0,
		},
		modal: 20,
		image: 12,
		avatar: 9999, // Circular
		tab: 12,
		tabBar: 20,
		listItem: 8,
	},
	input: 8,
	card: 12,
};
export const spacing = {
	base: 8,
	xxs: 2,
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 40,
	xxxl: 48,
	card: {
		default: 16,
		tight: 12,
		loose: 20,
	},
	button: {
		default: {
			vertical: 12,
			horizontal: 20,
			paddingVertical: 12,
			paddingHorizontal: 20,
		},
		small: {
			vertical: 8,
			horizontal: 12,
			paddingVertical: 8,
			paddingHorizontal: 12,
		},
		large: {
			vertical: 16,
			horizontal: 24,
			paddingVertical: 16,
			paddingHorizontal: 24,
		},
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	input: {
		padding: 14,
		marginBottom: 16,
		borderRadius: 8,
		borderWidth: 1,
	},
	icon: {
		tiny: 12,
		small: 16,
		medium: 24,
		large: 32,
		xlarge: 40,
	},
	avatar: {
		xs: 24,
		sm: 32,
		md: 40,
		lg: 56,
		xl: 80,
		xxl: 120,
	},
	screen: {
		padding: 20,
		horizontal: 20,
		vertical: 16,
	},
	gutter: 16,
	container: 20,
};
