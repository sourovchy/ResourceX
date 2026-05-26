import React from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    isDestructive?: boolean;
};

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    isDestructive = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-surface shadow-xl border border-borderLight animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                            {isDestructive ? (
                                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                            ) : null}
                            <h2 className="text-lg sm:text-xl font-semibold text-textPrimary leading-tight break-words">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            aria-label="Close dialog"
                            className="flex-shrink-0 p-1 rounded-full text-textTertiary hover:bg-surfaceVariant hover:text-textPrimary transition disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <p className="text-sm text-textSecondary leading-relaxed break-words">
                        {message}
                    </p>
                    
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-textPrimary bg-surface border border-borderLight rounded-xl hover:bg-surfaceVariant transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-xl transition shadow-sm disabled:opacity-50 ${
                                isDestructive 
                                    ? "bg-rose-600 text-white hover:bg-rose-700"
                                    : "bg-primary text-onPrimary hover:bg-primaryDark"
                            }`}
                        >
                            {isLoading ? "Please wait..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
