import React from "react";
import { Star } from "lucide-react";

export function StarRow({
  value,
  size = "h-4 w-4",
}: {
  value: number;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));
        return (
          <span key={star} className={`relative inline-block ${size}`}>
            <Star className={`${size} text-outlineVariant`} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={`${size} fill-warning text-warning`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
