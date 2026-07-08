import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { TrustLevel, trustLevelFor, TRUST_LEVEL_LABEL } from '@/types/trust';

interface TrustBadgeProps {
  score?: number;
  /** Optional explicit level; defaults to the level derived from {@link score}. */
  level?: TrustLevel;
  showIcon?: boolean;
  compact?: boolean;
  /** Show the trust level label (e.g. "Trusted Member") instead of just the score. */
  showLabel?: boolean;
  className?: string;
}

const LEVEL_STYLES: Record<
  TrustLevel,
  { text: string; bg: string; border: string; ring: string; Icon: typeof ShieldCheck }
> = {
  ELITE: {
    text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-100', Icon: ShieldCheck,
  },
  TRUSTED: {
    text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-100', Icon: ShieldCheck,
  },
  STANDARD: {
    text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', ring: 'ring-slate-100', Icon: ShieldCheck,
  },
  AT_RISK: {
    text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-100', Icon: ShieldAlert,
  },
  HIGH_RISK: {
    text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', ring: 'ring-orange-100', Icon: ShieldAlert,
  },
  SUSPENDED_RISK: {
    text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-100', Icon: ShieldX,
  },
};

const TrustBadge = ({
  score = 100,
  level,
  showIcon = true,
  compact = false,
  showLabel = true,
  className = '',
}: TrustBadgeProps) => {
  const resolvedLevel = level ?? trustLevelFor(score);
  const styles = LEVEL_STYLES[resolvedLevel];
  const { Icon } = styles;

  // Compact Badge — just the icon + score.
  if (compact) {
    return (
      <span
        title={TRUST_LEVEL_LABEL[resolvedLevel]}
        className={`
          inline-flex items-center justify-center
          rounded-full border px-2 py-1
          text-[11px] font-bold leading-none shadow-sm ring-1 transition-all
          sm:px-2.5 sm:text-xs
          ${styles.text} ${styles.bg} ${styles.border} ${styles.ring} ${className}
        `}
      >
        {showIcon && <Icon className="mr-1 h-3 w-3 shrink-0" />}
        {score}
      </span>
    );
  }

  // Full Badge — icon + level label + score.
  return (
    <div
      title={TRUST_LEVEL_LABEL[resolvedLevel]}
      className={`
        inline-flex max-w-full items-center gap-1.5
        rounded-full border px-2.5 py-1
        text-[11px] font-semibold shadow-sm ring-1 transition-all duration-200
        hover:shadow-md
        sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs md:text-sm
        ${styles.text} ${styles.bg} ${styles.border} ${styles.ring} ${className}
      `}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />}
      <span className="truncate whitespace-nowrap">
        {showLabel ? `${TRUST_LEVEL_LABEL[resolvedLevel]} · ` : ''}
        <span className="font-bold">{score}</span>
      </span>
    </div>
  );
};

export default TrustBadge;
