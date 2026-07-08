"use client";

import React, { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, AlertCircle, X } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import { TiltCard } from "./TiltCard";

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    isDestructive?: boolean;
    /** Render a required free-text reason field with inline validation. */
    requireReason?: boolean;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    reasonValue?: string;
    onReasonChange?: (value: string) => void;
    /** Externally-controlled inline error (shown inside the modal body). */
    error?: string | null;
    /** Block the confirm action regardless of the built-in reason check. */
    confirmDisabled?: boolean;
    /** Extra body content (e.g. inputs, option pickers) rendered above the footer. */
    children?: React.ReactNode;
};

/**
 * Standardized confirmation dialog.
 *
 * - Accessible layering & focus handling via `useDialog` (scroll-lock, focus trap,
 *   Escape to close, focus restore).
 * - Clean header / body / footer structure with consistent surface, shadow and border.
 * - Validation errors render *inside* the modal (never behind it) with role="alert".
 * - The confirm button is disabled until any required reason is provided.
 */
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
    requireReason = false,
    reasonLabel = "Reason",
    reasonPlaceholder = "Write a short reason…",
    reasonValue = "",
    onReasonChange,
    error = null,
    confirmDisabled = false,
    children,
}: ConfirmModalProps) {
    const dialogRef = useDialog({ open: isOpen, onClose: onCancel, closeOnEsc: !isLoading });
    const [localError, setLocalError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const reasonId = useId();
    const errorId = useId();

    // Portal target is only available on the client.
    useEffect(() => setMounted(true), []);

    // Clear transient validation state whenever the modal (re)opens.
    useEffect(() => {
        if (isOpen) setLocalError(null);
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const reasonMissing = requireReason && !reasonValue.trim();
    const shownError = error ?? localError;
    const confirmIsDisabled = isLoading || confirmDisabled || reasonMissing;

    const handleConfirm = () => {
        if (reasonMissing) {
            setLocalError(`${reasonLabel} is required.`);
            return;
        }
        onConfirm();
    };

    return createPortal(
        <div
            onClick={() => !isLoading && onCancel()}
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-3 sm:p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-200">
            <style dangerouslySetInnerHTML={{ __html: `
				@keyframes confirm-modal-scale-up {
					0% { transform: scale(0.94); opacity: 0; }
					100% { transform: scale(1); opacity: 1; }
				}
				.animate-confirm-modal-enter {
					animation: confirm-modal-scale-up 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
				}
				@media (prefers-reduced-motion: reduce) {
					.animate-confirm-modal-enter {
						animation: none !important;
						transform: none !important;
					}
				}
			`}} />
            <TiltCard
                ref={dialogRef as any}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                maxTilt={2}
                hoverScale={1.01}
                glare={false}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-md max-h-[90dvh] flex-col overflow-hidden border border-borderLight/60 bg-surface/90 shadow-2xl backdrop-blur-md outline-none animate-confirm-modal-enter">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-borderLight p-4 sm:p-5">
                    <div className="flex items-start gap-3 min-w-0">
                        {isDestructive ? (
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-errorLight text-error">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        ) : null}
                        <h2 className="text-lg sm:text-xl font-bold text-textPrimary leading-tight break-words">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        aria-label="Close dialog"
                        className="flex-shrink-0 p-1 rounded-full text-textTertiary hover:bg-surfaceVariant hover:text-textPrimary transition disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {message ? (
                        <p className="text-sm text-textSecondary leading-relaxed break-words">
                            {message}
                        </p>
                    ) : null}

                    {children}

                    {requireReason ? (
                        <div className="space-y-1.5">
                            <label
                                htmlFor={reasonId}
                                className="block text-xs font-bold uppercase tracking-wider text-textTertiary">
                                {reasonLabel} <span className="text-error">*</span>
                            </label>
                            <textarea
                                id={reasonId}
                                value={reasonValue}
                                onChange={(e) => {
                                    onReasonChange?.(e.target.value);
                                    if (localError) setLocalError(null);
                                }}
                                placeholder={reasonPlaceholder}
                                aria-invalid={Boolean(shownError)}
                                aria-describedby={shownError ? errorId : undefined}
                                className="min-h-24 w-full resize-none rounded-xl border border-outlineVariant bg-surface px-3 py-2 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    ) : null}

                    {shownError ? (
                        <div
                            id={errorId}
                            role="alert"
                            className="flex items-start gap-2 rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-error animate-in fade-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{shownError}</span>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-borderLight bg-surfaceVariant/30 p-4 sm:p-5">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-textPrimary bg-surface border border-borderLight rounded-xl hover:bg-surfaceVariant enabled:active:scale-[0.97] transition-all disabled:opacity-50">
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirmIsDisabled}
                        className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${
                            isDestructive
                                ? "bg-error text-white hover:bg-error/90"
                                : "bg-primary text-onPrimary hover:bg-primaryDark"
                        }`}>
                        {isLoading ? "Please wait..." : confirmText}
                    </button>
                </div>
            </TiltCard>
        </div>,
        document.body,
    );
}
