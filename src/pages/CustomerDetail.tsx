import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Check, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { activitiesSlice, customersSlice, tasksSlice } from '@/store/slices/entities';
import { memberName } from '@/data/seed';
import { isOverdue, longDate, money, relativeDay, shortDate } from '@/lib/format';
import { activityMeta, priorityTone, stageTone } from '@/lib/meta';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomerForm from '@/components/forms/CustomerForm';
import ActivityForm from '@/components/forms/ActivityForm';
import TaskForm from '@/components/forms/TaskForm';
import NotFound from './NotFound';

const tabs = ['Timeline', 'Deals', 'Tasks'] as const;

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const customer = useAppSelector((s) => s.customers.items.find((c) => c.id === id));
  const activities = useAppSelector((s) => s.activities.items.filter((a) => a.customerId === id));
  const deals = useAppSelector((s) => s.deals.items.filter((d) => d.customerId === id));
  const tasks = useAppSelector((s) => s.tasks.items.filter((t) => t.customerId === id));
  const [tab, setTab] = useState<(typeof tabs)[number]>('Timeline');
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!customer) return <NotFound />;
  const timeline = [...activities].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const openValue = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" />All customers</Link>

      <section className="card mb-6 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-ink-900 via-ink-800 to-brand-600" />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="-mt-10 flex items-end gap-4"><Avatar name={customer.company} size="xl" className="ring-4 ring-white" />
            <div className="pb-1"><h1 className="text-xl font-extrabold sm:text-2xl">{customer.company}</h1><p className="text-sm text-slate-500">{customer.industry} · Customer since {shortDate(customer.since)}</p></div>
          </div>
          <div className="flex gap-2"><Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>Edit</Button><Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleting(true)} aria-label="Delete customer" /></div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-bold">Contact</h2>
            <div className="mb-4 flex items-center gap-3"><Avatar name={customer.name} /><div><p className="font-semibold">{customer.name}</p><Badge tone={customer.tier === 'Enterprise' ? 'violet' : customer.tier === 'Growth' ? 'teal' : 'slate'}>{customer.tier}</Badge></div></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><a href={`mailto:${customer.email}`} className="truncate font-medium hover:text-brand-600">{customer.email}</a></li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><a href={`tel:${customer.phone}`} className="font-medium hover:text-brand-600">{customer.phone}</a></li>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" />{customer.city}</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm"><Avatar name={memberName(customer.owner)} size="xs" /><span className="text-slate-500">Account owner</span><b className="ml-auto">{memberName(customer.owner)}</b></div>
          </section>
          <section className="grid grid-cols-2 gap-3">
            {[['Lifetime revenue', money(customer.revenue, true)], ['Open pipeline', money(openValue, true)], ['Interactions', String(activities.length)], ['Open tasks', String(tasks.filter((t) => t.status !== 'done').length)]].map(([l, v]) => (
              <div key={l} className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-lg font-extrabold">{v}</p></div>
            ))}
          </section>
          {customer.notes && <section className="card p-5"><h2 className="mb-2 text-sm font-bold">Notes</h2><p className="text-sm text-slate-600">{customer.notes}</p></section>}
        </aside>

        <section className="card min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 pt-3">
            <div className="flex gap-5" role="tablist">{tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('-mb-px border-b-2 pb-3 text-sm font-semibold transition', tab === t ? 'border-brand-500 text-ink-900' : 'border-transparent text-slate-500 hover:text-ink-900')}>{t}</button>)}</div>
            <Button size="sm" className="mb-2" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => (tab === 'Tasks' ? setAddingTask(true) : setLogging(true))}>{tab === 'Tasks' ? 'Add task' : 'Log activity'}</Button>
          </div>
          <div className="p-5">
            {tab === 'Timeline' && (timeline.length === 0 ? <EmptyState icon={CalendarClock} title="No interactions yet" text="Log a call, email or meeting to build this customer’s history." /> : (
              <ol className="relative space-y-6 border-l-2 border-slate-100 pl-6">
                {timeline.map((a) => { const m = activityMeta[a.type]; return (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[35px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white" style={{ background: `${m.color}22`, color: m.color }}><m.icon className="h-3.5 w-3.5" /></span>
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.subject}</p><Badge tone={m.tone}>{m.label}</Badge>{!a.done && <Badge tone="gold">Planned</Badge>}</div>
                    <p className="mt-0.5 text-xs text-slate-500">{longDate(a.date)} · {a.time} · {memberName(a.owner)}</p>
                    {a.notes && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{a.notes}</p>}
                    {!a.done && <Button size="sm" variant="soft" className="mt-2" icon={<Check className="h-3.5 w-3.5" />} onClick={() => { dispatch(activitiesSlice.actions.updated({ ...a, done: true })); toast('Marked as done'); }}>Mark done</Button>}
                  </li>); })}
              </ol>))}
            {tab === 'Deals' && (deals.length === 0 ? <EmptyState icon={CalendarClock} title="No deals linked" text="Deals linked to this customer in the pipeline will appear here." /> : (
              <ul className="divide-y divide-slate-100">{deals.map((d) => <li key={d.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">{d.title}</p><p className="text-xs text-slate-500">Close {shortDate(d.closeDate)} · {memberName(d.owner)}</p></div><div className="flex items-center gap-3"><Badge tone={stageTone[d.stage]}>{d.stage}</Badge><b>{money(d.value)}</b></div></li>)}</ul>))}
            {tab === 'Tasks' && (tasks.length === 0 ? <EmptyState icon={Check} title="No tasks for this customer" text="Create a task to remember the next step." /> : (
              <ul className="divide-y divide-slate-100">{tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <button onClick={() => dispatch(tasksSlice.actions.updated({ ...t, status: t.status === 'done' ? 'todo' : 'done' }))} aria-label={t.status === 'done' ? 'Reopen task' : 'Complete task'} className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', t.status === 'done' ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300')}>{t.status === 'done' && <Check className="h-3.5 w-3.5" />}</button>
                  <div className="min-w-0 flex-1"><p className={cn('font-semibold', t.status === 'done' && 'text-slate-400 line-through')}>{t.title}</p><p className={cn('text-xs', isOverdue(t.due, t.status) ? 'font-semibold text-coral-600' : 'text-slate-500')}>{relativeDay(t.due)} · {memberName(t.assignee)}</p></div>
                  <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                </li>))}</ul>))}
          </div>
        </section>
      </div>

      <CustomerForm open={editing} initial={customer} onClose={() => setEditing(false)} />
      <ActivityForm open={logging} customerId={customer.id} onClose={() => setLogging(false)} />
      <TaskForm open={addingTask} customerId={customer.id} onClose={() => setAddingTask(false)} />
      {deleting && <ConfirmDialog title="Delete customer?" message={`${customer.company} and its profile will be removed. Linked deals, tasks and activities stay in the system.`} onClose={() => setDeleting(false)} onConfirm={() => { dispatch(customersSlice.actions.removed(customer.id)); toast('Customer deleted', 'info'); nav('/customers'); }} />}
    </div>
  );
}
