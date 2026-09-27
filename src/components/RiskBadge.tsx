import React from 'react';
import { RiskCategory } from '../types';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  category: RiskCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const styles = {
    CRITICAL: {
      container: 'bg-rose-500/15 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />,
      dot: 'bg-rose-500 animate-ping',
      label: 'CRITICAL RISK (P0)',
    },
    HIGH: {
      container: 'bg-amber-500/15 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      dot: 'bg-amber-400',
      label: 'HIGH RISK (P1)',
    },
    MODERATE: {
      container: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-yellow-400 shrink-0" />,
      dot: 'bg-yellow-400',
      label: 'MODERATE RISK (P2)',
    },
    LOW: {
      container: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
      dot: 'bg-emerald-400',
      label: 'LOW RISK (P3)',
    },
  }[category];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${styles.container} ${sizeClasses} ${className}`}
    >
      {showIcon && styles.icon}
      <span>{styles.label}</span>
    </span>
  );
};
