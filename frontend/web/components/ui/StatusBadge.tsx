export function StatusBadge({ status }: { status: string }) {
    const normalizedStatus = status.toUpperCase();

    // Neutral default — themed via tokens (light + dark parity).
    let badgeClass = "bg-surfaceVariant text-textSecondary border-border";

    if (["ACTIVE", "APPROVED", "COMPLETED", "RESOLVED"].includes(normalizedStatus)) {
        badgeClass = "bg-successLight text-successDark border-success/30";
    } else if (["PENDING", "IN_PROGRESS", "REVIEWING"].includes(normalizedStatus)) {
        badgeClass = "bg-warningLight text-warningDark border-warning/30";
    } else if (["REJECTED", "FAILED", "SUSPENDED", "BANNED"].includes(normalizedStatus)) {
        badgeClass = "bg-errorLight text-errorDark border-error/30";
    } else if (["INACTIVE"].includes(normalizedStatus)) {
        badgeClass = "bg-surfaceVariant text-textTertiary border-border";
    }

    return (
        <span
            className={`inline-flex max-w-full items-center justify-center rounded-full border px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] leading-none whitespace-nowrap ${badgeClass}`}
        >
            {normalizedStatus}
        </span>
    );
}
