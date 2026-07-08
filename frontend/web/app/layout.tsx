import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";

// Primary UI typeface — professional, modern sans.
const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

// Monospace — reserved for IDs, codes, and the `font-mono` utility.
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "ResourceX",
	description: "Cross-Campus Resource Sharing Platform",
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml" }
		],
		shortcut: ["/icon.svg"],
		apple: [
			{ url: "/icon.svg" }
		],
	},
	manifest: "/manifest.json",
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#da7756",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${jakarta.variable} ${jetbrainsMono.variable}`}
		>
			<body className={`${jakarta.className} graph-grid`}>
				<ThemeProvider>
					<ToastProvider>
						<AuthProvider>{children}</AuthProvider>
						<ToastContainer />
					</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
