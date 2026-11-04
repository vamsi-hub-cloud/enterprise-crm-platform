import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Building2, KanbanSquare, Menu, Plus, Search, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebar } from '@/store/slices/uiSlice';
import { isOverdue } from '@/lib/format';
import Button from '../ui/Button';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { leads, customers, deals, tasks } = useAppSelector((s) => ({ leads: s.leads.items, customers: s.customers.items, deals: s.deals.items, tasks: s.tasks.items }), (a, b) => a.leads === b.leads && a.customers === b.customers && a.deals === b.deals && a.tasks === b.tasks);
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const overdue = tasks.filter((t) => isOverdue(t.due, t.status)).length;

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const has = (...x: string[]) => x.some((v) => v.toLowerCase().includes(s));
    return [
      ...customers.filter((c) => has(c.company, c.name)).map((c) => ({ key: c.id, label: c.company, sub: 'Customer', to: `/customers/${c.id}`, icon: Building2 })),
      ...leads.filter((l) => has(l.name, l.company)).map((l) => ({ key: l.id, label: l.name, sub: `Lead · ${l.company}`, to: `/leads?q=${encodeURIComponent(l.name)}`, icon: UserPlus })),
      ...deals.filter((d) => has(d.title, d.company)).map((d) => ({ key: d.id, label: d.title, sub: `Deal · ${d.company}`, to: '/pipeline', icon: KanbanSquare })),
    ].slice(0, 7);
  }, [q, leads, customers, deals]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-canvas/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={() => dispatch(setSidebar(true))} className="rounded-lg p-2 text-slate-600 hover:bg-slate-200/60 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder="Search customers, leads and deals" aria-label="Search" className="input rounded-xl bg-white pl-9" />
        {focus && q.trim().length >= 2 && (
          <div className="card absolute left-0 right-0 top-12 z-30 animate-pop overflow-hidden p-1.5">
            {results.length === 0 ? <p className="px-3 py-3 text-sm text-slate-500">No matches for “{q}”.</p> : results.map((r) => (
              <button key={r.key} onMouseDown={() => { nav(r.to); setQ(''); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50">
                <r.icon className="h-4 w-4 text-brand-600" />
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{r.label}</span><span className="block truncate text-xs text-slate-500">{r.sub}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => nav('/tasks')} className="relative rounded-xl bg-white p-2.5 text-slate-600 shadow-card hover:text-ink-900" aria-label={`${overdue} overdue tasks`}>
          <Bell className="h-[18px] w-[18px]" />
          {overdue > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">{overdue}</span>}
        </button>
        <Button onClick={() => nav('/leads?new=1')} icon={<Plus className="h-4 w-4" />} className="hidden sm:inline-flex">New lead</Button>
      </div>
    </header>
  );
}
