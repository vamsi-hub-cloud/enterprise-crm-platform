import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const palette = ['bg-brand-100 text-brand-700', 'bg-violet-100 text-violet-700', 'bg-gold-100 text-gold-600', 'bg-coral-100 text-coral-600', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700'];
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export default function Avatar({ name, size = 'md', className }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sz = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }[size];
  return (
    <span title={name} className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold', sz, palette[hash(name) % palette.length], className)}>
      {initials(name)}
    </span>
  );
}
