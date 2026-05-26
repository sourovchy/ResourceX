"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "light",
	toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "th-theme";

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;

	document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
		const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		const initialTheme = saved ?? (systemPrefersDark ? "dark" : "light");

		setTheme(initialTheme);
		applyTheme(initialTheme);

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (event: MediaQueryListEvent) => {
			const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

			if (storedTheme) return;

			const nextTheme: Theme = event.matches ? "dark" : "light";
			setTheme(nextTheme);
			applyTheme(nextTheme);
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === "light" ? "dark" : "light";
			window.localStorage.setItem(THEME_STORAGE_KEY, next);
			applyTheme(next);
			return next;
		});
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
