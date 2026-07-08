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
	success: "bg-successLight/65 border-success/20 text-successDark",
	error: "bg-errorLight/65 border-error/20 text-errorDark",
	info: "bg-primaryLight/65 border-primary/20 text-primary",
};

function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
	const Icon = ICON[item.type];
	return (
		<div
			className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium glass-surface shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${STYLE[item.type]}`}>
			<Icon className="mt-0.5 h-4 w-4 shrink-0" />
			<p className="flex-1">{item.message}</p>
			<button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity active:scale-95" aria-label="Dismiss">
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
