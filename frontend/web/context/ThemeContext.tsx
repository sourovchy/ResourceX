"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
	setThemeMode: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "th-theme";
const ANIMATION_CLASS = "theme-transitioning";

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "light";

	const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
	if (saved === "light" || saved === "dark") return saved;

	return getSystemTheme();
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
}

function animateThemeChange() {
	if (typeof document === "undefined") return;

	const root = document.documentElement;

	// Respect reduced motion.
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	root.classList.remove(ANIMATION_CLASS);
	// Force reflow so the animation class re-triggers cleanly.
	void root.offsetHeight;
	root.classList.add(ANIMATION_CLASS);

	window.setTimeout(() => {
		root.classList.remove(ANIMATION_CLASS);
	}, 250);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

			// Only follow system preference if the user has not chosen a theme.
			if (storedTheme === "light" || storedTheme === "dark") return;

			const nextTheme: Theme = mediaQuery.matches ? "dark" : "light";
			setTheme(nextTheme);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	const setThemeMode = useCallback((nextTheme: Theme) => {
		window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		animateThemeChange();
		setTheme(nextTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeMode(theme === "light" ? "dark" : "light");
	}, [setThemeMode, theme]);

	const value = useMemo(
		() => ({
			theme,
			toggleTheme,
			setThemeMode,
		}),
		[theme, toggleTheme, setThemeMode],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}