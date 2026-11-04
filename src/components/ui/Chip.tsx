import { cn } from '@/lib/cn';
export default function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition', active ? 'border-ink-900 bg-ink-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}>
      {children}
    </button>
  );
}
