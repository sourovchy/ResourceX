import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface TrustBadgeProps {
  score?: number;
  showIcon?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

const TrustBadge = ({
  score = 95,
  showIcon = true,
  compact = false,
  showLabel = true,
  className = '',
}: TrustBadgeProps) => {

  const getStyles = () => {
    if (score >= 90) {
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: 'ring-emerald-100',
      };
    }

    if (score >= 70) {
      return {
        text: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        ring: 'ring-blue-100',
      };
    }

    if (score >= 50) {
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'ring-amber-100',
      };
    }

    return {
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      ring: 'ring-red-100',
    };
  };

  const styles = getStyles();

  // Compact Badge
  if (compact) {
    return (
      <span
        className={`
          inline-flex items-center justify-center
          rounded-full
          border
          px-2 py-1
          text-[11px] font-bold
          leading-none
          shadow-sm
          ring-1
          transition-all
          sm:px-2.5 sm:text-xs
          ${styles.text}
          ${styles.bg}
          ${styles.border}
          ${styles.ring}
          ${className}
        `}
      >
        {showIcon && (
          <ShieldCheck className="mr-1 h-3 w-3 shrink-0" />
        )}

        {score}
      </span>
    );
  }

  // Full Badge
  return (
    <div
      className={`
        inline-flex max-w-full items-center gap-1.5
        rounded-full
        border
        px-2.5 py-1
        text-[11px] font-semibold
        shadow-sm
        ring-1
        transition-all duration-200
        hover:shadow-md
        sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs
        md:text-sm
        ${styles.text}
        ${styles.bg}
        ${styles.border}
        ${styles.ring}
        ${className}
      `}
    >
      {showIcon && (
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
      )}

      <span className="truncate whitespace-nowrap">
        {showLabel ? 'Trust Score:' : ''}
        {showLabel && ' '}
        <span className="font-bold">{score}</span>
      </span>
    </div>
  );
};

export default TrustBadge;