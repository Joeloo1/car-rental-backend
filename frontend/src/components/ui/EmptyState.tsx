import React from 'react';
import type { LucideIcon } from '@/lib/icons';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-surface-1 text-ink-tertiary">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-heading text-lg font-bold tracking-tight text-ink-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-tertiary">{description}</p>
      )}
      {action && (
        <button className="btn-primary btn-sm mt-6" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
