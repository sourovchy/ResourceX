import { LucideIcon } from "lucide-react";

export function PageEmpty({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[220px] sm:min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-borderLight bg-surfaceVariant text-center px-4 py-8 sm:p-6">
            <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-textTertiary" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold text-textPrimary break-words">
                {title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-textSecondary break-words">
                {description}
            </p>
        </div>
    );
}
