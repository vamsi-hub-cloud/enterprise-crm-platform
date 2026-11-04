import type { ReactNode } from 'react';
import { toneClass, type Tone } from '@/lib/meta';
import { cn } from '@/lib/cn';

export default function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', toneClass[tone], className)}>
      {children}
    </span>
  );
}
