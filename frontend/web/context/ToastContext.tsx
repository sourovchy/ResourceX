"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
	id: string;
	message: string;
	type: ToastType;
};

type ToastContextValue = {
	toasts: ToastItem[];
	toast: (message: string, type?: ToastType) => void;
	dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(
		(message: string, type: ToastType = "success") => {
			const id = Math.random().toString(36).slice(2);
			setToasts((prev) => [...prev, { id, message, type }]);
			setTimeout(() => dismiss(id), 4000);
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ toasts, toast, dismiss }}>
			{children}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
}
