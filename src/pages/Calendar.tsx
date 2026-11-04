import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { longDate, todayISO, toISO } from '@/lib/format';
import { activityMeta, priorityTone } from '@/lib/meta';
import { memberName } from '@/data/seed';
import { cn } from '@/lib/cn';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar() {
  const tasks = useAppSelector((s) => s.tasks.items);
  const acts = useAppSelector((s) => s.activities.items);
  const deals = useAppSelector((s) => s.deals.items);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(todayISO());

  const cells = useMemo(() => {
    const first = (cursor.getDay() + 6) % 7;
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => {
      const n = i - first + 1;
      return n < 1 || n > days ? null : toISO(new Date(cursor.getFullYear(), cursor.getMonth(), n));
    });
  }, [cursor]);

  const eventsOn = (iso: string) => ({
    tasks: tasks.filter((t) => t.due === iso), acts: acts.filter((a) => a.date === iso), deals: deals.filter((d) => d.closeDate === iso && d.stage !== 'Won' && d.stage !== 'Lost'),
  });
  const sel = eventsOn(selected);
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Task deadlines, planned activities and expected deal closes."
        actions={<><Button variant="secondary" size="sm" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(todayISO()); }}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => shift(-1)} aria-label="Previous month" icon={<ChevronLeft className="h-4 w-4" />} /><Button variant="secondary" size="sm" onClick={() => shift(1)} aria-label="Next month" icon={<ChevronRight className="h-4 w-4" />} /></>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="card p-3 sm:p-5">
          <h2 className="mb-4 px-1 text-lg font-extrabold">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{dows.map((d) => <div key={d} className="py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((iso, i) => {
              if (!iso) return <div key={i} className="min-h-14 sm:min-h-24" />;
              const ev = eventsOn(iso); const isToday = iso === todayISO(); const isSel = iso === selected;
              return (
                <button key={iso} onClick={() => setSelected(iso)} aria-label={longDate(iso)} aria-pressed={isSel}
                  className={cn('flex min-h-14 flex-col rounded-xl border p-1.5 text-left transition sm:min-h-24 sm:p-2', isSel ? 'border-brand-400 bg-brand-50' : 'border-transparent hover:bg-slate-50', )}>
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', isToday && 'bg-ink-900 text-white')}>{Number(iso.slice(8))}</span>
                  <span className="mt-auto flex flex-wrap gap-1 sm:mt-1">
                    {ev.tasks.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />}
                    {ev.acts.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    {ev.deals.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
                  </span>
                  <span className="mt-1 hidden space-y-0.5 sm:block">
                    {[...ev.tasks.map((t) => t.title), ...ev.acts.map((a) => a.subject)].slice(0, 2).map((x) => <span key={x} className="block truncate rounded bg-slate-100 px-1 text-[10px] font-medium text-slate-600">{x}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 px-1 text-xs text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-coral-500" />Task due</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-500" />Activity</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-gold-400" />Deal close</span></div>
        </section>

        <aside className="card h-fit p-5">
          <h2 className="font-bold">{longDate(selected)}</h2>
          {sel.tasks.length + sel.acts.length + sel.deals.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nothing scheduled. Enjoy the breathing room.</p> : (
            <ul className="mt-4 space-y-3">
              {sel.acts.map((a) => { const m = activityMeta[a.type]; return <li key={a.id} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${m.color}1f`, color: m.color }}><m.icon className="h-4 w-4" /></span><div><p className="text-sm font-semibold">{a.subject}</p><p className="text-xs text-slate-500">{a.time} · {memberName(a.owner)}</p></div></li>; })}
              {sel.tasks.map((t) => <li key={t.id} className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{t.title}</p><p className="text-xs text-slate-500">Due · {memberName(t.assignee)}</p></div><Badge tone={priorityTone[t.priority]}>{t.priority}</Badge></li>)}
              {sel.deals.map((d) => <li key={d.id}><p className="text-sm font-semibold">{d.title}</p><p className="text-xs text-slate-500">Expected close · {d.company}</p></li>)}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
