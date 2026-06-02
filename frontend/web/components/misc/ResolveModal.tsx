import React from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Thin wrapper over the standardized ConfirmModal so dispute resolution shares
 * the same surface, layering, focus handling and button states as every other
 * confirmation dialog in the app.
 */
const ResolveModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ResolveModalProps) => (
  <ConfirmModal
    isOpen={isOpen}
    title="Resolve Issue"
    message="Are you sure you want to resolve this issue? This action cannot be undone."
    confirmText={isLoading ? "Resolving..." : "Confirm"}
    cancelText="Cancel"
    onConfirm={onConfirm}
    onCancel={onClose}
    isLoading={isLoading}
  />
);

export default ResolveModal;
