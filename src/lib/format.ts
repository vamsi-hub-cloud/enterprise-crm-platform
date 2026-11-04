const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const todayISO = () => toISO(new Date());

export const money = (n: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : { maximumFractionDigits: 0 }),
  }).format(n);

export const shortDate = (iso: string) => parseISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const longDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export const dayDiff = (iso: string) => Math.round((parseISO(iso).getTime() - parseISO(todayISO()).getTime()) / 86400000);
export const relativeDay = (iso: string) => {
  const n = dayDiff(iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return n > 0 ? `In ${n} days` : `${-n} days ago`;
};
export const isOverdue = (due: string, status: string) => status !== 'done' && due < todayISO();
export const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));
