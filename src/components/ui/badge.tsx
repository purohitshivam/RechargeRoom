import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'solid' | 'subtle';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    outline: 'border border-neutral-400 text-neutral-800 bg-transparent',
    solid: 'bg-neutral-900 text-white border border-neutral-900',
    subtle: 'bg-neutral-50 text-neutral-600 border border-neutral-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-medium tracking-wider uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
