import { useMemo, useState } from 'react';
import { Check, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { activitiesSlice } from '@/store/slices/entities';
import { ACTIVITY_TYPES, type Activity, type ActivityType } from '@/types';
import { memberName } from '@/data/seed';
import { activityCounts } from '@/lib/metrics';
import { longDate } from '@/lib/format';
import { activityMeta } from '@/lib/meta';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import SearchBox from '@/components/ui/SearchBox';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ActivityForm from '@/components/forms/ActivityForm';

export default function Activities() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const acts = useAppSelector((s) => s.activities.items);
  const customers = useAppSelector((s) => s.customers.items);
  const [type, setType] = useState<ActivityType | 'all'>('all');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<{ a?: Activity } | null>(null);
  const [deleting, setDeleting] = useState<Activity | undefined>();

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = acts.filter((a) => (type === 'all' || a.type === type) && (!s || a.subject.toLowerCase().includes(s) || (customers.find((c) => c.id === a.customerId)?.company ?? '').toLowerCase().includes(s)))
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    const map = new Map<string, Activity[]>();
    list.forEach((a) => map.set(a.date, [...(map.get(a.date) ?? []), a]));
    return [...map.entries()];
  }, [acts, customers, type, q]);

  return (
    <div>
      <PageHeader title="Activities" subtitle="Every call, meeting, email and follow-up in one timeline." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setForm({})}>Log activity</Button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {activityCounts(acts).map(({ type: t, count }) => { const m = activityMeta[t]; return (
          <button key={t} onClick={() => setType(type === t ? 'all' : t)} className={`card flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 ${type === t ? 'ring-2 ring-brand-400' : ''}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${m.color}1f`, color: m.color }}><m.icon className="h-5 w-5" /></span>
            <span><span className="block text-xl font-extrabold leading-tight">{count}</span><span className="text-xs font-medium text-slate-500">{m.label}s</span></span>
          </button>); })}
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search subject or customer" />
        <div className="flex gap-2 overflow-x-auto"><Chip active={type === 'all'} onClick={() => setType('all')}>All</Chip>{ACTIVITY_TYPES.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{activityMeta[t].label}</Chip>)}</div>
      </div>

      {groups.length === 0 ? <div className="card"><EmptyState icon={History} title="No activities found" text="Log your first customer interaction to start the timeline." action={<Button onClick={() => setForm({})}>Log activity</Button>} /></div> : (
        <div className="space-y-6">
          {groups.map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 px-1 text-sm font-bold text-slate-500">{longDate(date)}</h2>
              <ul className="card divide-y divide-slate-100">
                {items.map((a) => { const m = activityMeta[a.type]; const c = customers.find((x) => x.id === a.customerId); return (
                  <li key={a.id} className="flex flex-wrap items-start gap-4 p-4 sm:flex-nowrap">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${m.color}1f`, color: m.color }}><m.icon className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.subject}</p><Badge tone={m.tone}>{m.label}</Badge>{!a.done && <Badge tone="gold">Planned</Badge>}</div>
                      <p className="mt-0.5 text-xs text-slate-500">{a.time} · {c?.company ?? 'No customer'} · {memberName(a.owner)}</p>
                      {a.notes && <p className="mt-2 text-sm text-slate-600">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      {!a.done && <Button size="sm" variant="soft" icon={<Check className="h-3.5 w-3.5" />} onClick={() => { dispatch(activitiesSlice.actions.updated({ ...a, done: true })); toast('Marked as done'); }}>Done</Button>}
                      <button onClick={() => setForm({ a })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink-900" aria-label="Edit activity"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleting(a)} className="rounded-lg p-2 text-slate-400 hover:bg-coral-50 hover:text-coral-600" aria-label="Delete activity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>); })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <ActivityForm open={!!form} initial={form?.a} onClose={() => setForm(null)} />
      {deleting && <ConfirmDialog title="Delete activity?" message={`“${deleting.subject}” will be removed from the timeline.`} onClose={() => setDeleting(undefined)} onConfirm={() => { dispatch(activitiesSlice.actions.removed(deleting.id)); toast('Activity deleted', 'info'); }} />}
    </div>
  );
}
