"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast, type ToastItem } from "@/context/ToastContext";

const ICON = {
	success: CheckCircle2,
	error: AlertCircle,
	info: Info,
};

const STYLE = {
	success: "bg-successLight border-success/30 text-successDark",
	error: "bg-errorLight border-error/30 text-errorDark",
	info: "bg-primaryLight border-primary/30 text-primary",
};

function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
	const Icon = ICON[item.type];
	return (
		<div
			className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md text-sm font-medium ${STYLE[item.type]}`}>
			<Icon className="mt-0.5 h-4 w-4 shrink-0" />
			<p className="flex-1">{item.message}</p>
			<button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}

export function ToastContainer() {
	const { toasts, dismiss } = useToast();
	if (toasts.length === 0) return null;

	return (
		<div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
			{toasts.map((t) => (
				<ToastEntry key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
			))}
		</div>
	);
}
