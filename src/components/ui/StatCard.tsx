import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const tones = { teal: 'bg-brand-50 text-brand-600', gold: 'bg-gold-50 text-gold-600', coral: 'bg-coral-50 text-coral-600', violet: 'bg-violet-50 text-violet-600' };

export default function StatCard({ label, value, hint, icon: Icon, tone = 'teal' }: { label: string; value: string; hint?: string; icon: LucideIcon; tone?: keyof typeof tones }) {
  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone])}><Icon className="h-5 w-5" /></span>
    </div>
  );
}
