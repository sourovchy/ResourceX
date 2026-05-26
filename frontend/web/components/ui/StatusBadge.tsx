export function StatusBadge({ status }: { status: string }) {
    const normalizedStatus = status.toUpperCase();
    
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200 shadow-sm";

    if (["ACTIVE", "APPROVED", "COMPLETED", "RESOLVED"].includes(normalizedStatus)) {
        badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm";
    } else if (["PENDING", "IN_PROGRESS", "REVIEWING"].includes(normalizedStatus)) {
        badgeClass = "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
    } else if (["REJECTED", "CANCELLED", "FAILED", "SUSPENDED", "BANNED"].includes(normalizedStatus)) {
        badgeClass = "bg-rose-50 text-rose-700 border-rose-200 shadow-sm";
    } else if (["INACTIVE"].includes(normalizedStatus)) {
        badgeClass = "bg-slate-50 text-slate-500 border-slate-200 shadow-sm";
    }

    return (
        <span
            className={`inline-flex max-w-full items-center justify-center rounded-full border px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] leading-none whitespace-nowrap ${badgeClass}`}
        >
            {normalizedStatus}
        </span>
    );
}
