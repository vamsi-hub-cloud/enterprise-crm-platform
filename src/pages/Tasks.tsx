import { useMemo, useState } from 'react';
import { Calendar, Check, CheckSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { tasksSlice } from '@/store/slices/entities';
import { PRIORITIES, TASK_STATUSES, type Priority, type Task, type TaskStatus } from '@/types';
import { TEAM, memberName } from '@/data/seed';
import { isOverdue, relativeDay } from '@/lib/format';
import { priorityTone } from '@/lib/meta';
import { cn } from '@/lib/cn';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Chip from '@/components/ui/Chip';
import SearchBox from '@/components/ui/SearchBox';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TaskForm from '@/components/forms/TaskForm';

const cols: { key: TaskStatus; label: string; dot: string }[] = [
  { key: 'todo', label: 'To do', dot: '#94A3B8' }, { key: 'in_progress', label: 'In progress', dot: '#F0B84B' }, { key: 'done', label: 'Done', dot: '#16907F' },
];

export default function Tasks() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const tasks = useAppSelector((s) => s.tasks.items);
  const customers = useAppSelector((s) => s.customers.items);
  const [q, setQ] = useState('');
  const [assignee, setAssignee] = useState('all');
  const [priority, setPriority] = useState<Priority | 'All'>('All');
  const [form, setForm] = useState<{ task?: Task } | null>(null);
  const [deleting, setDeleting] = useState<Task | undefined>();

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => (assignee === 'all' || t.assignee === assignee) && (priority === 'All' || t.priority === priority) && (!s || t.title.toLowerCase().includes(s)));
  }, [tasks, q, assignee, priority]);
  const overdue = tasks.filter((t) => isOverdue(t.due, t.status)).length;
  const setStatus = (t: Task, status: TaskStatus) => { dispatch(tasksSlice.actions.updated({ ...t, status })); if (status === 'done') toast('Task completed'); };

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${tasks.filter((t) => t.status !== 'done').length} open${overdue ? ` · ${overdue} overdue` : ''}`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setForm({})}>New task</Button>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search tasks" />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Filter by assignee" className="input w-full sm:w-52"><option value="all">Everyone</option>{TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <div className="flex gap-2 overflow-x-auto"><Chip active={priority === 'All'} onClick={() => setPriority('All')}>Any priority</Chip>{PRIORITIES.map((p) => <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>{p}</Chip>)}</div>
      </div>

      {tasks.length === 0 ? <div className="card"><EmptyState icon={CheckSquare} title="No tasks yet" text="Create a task to assign work, set a priority and track the deadline." action={<Button onClick={() => setForm({})}>Create task</Button>} /></div> : (
        <div className="grid gap-4 lg:grid-cols-3">
          {cols.map((col) => {
            const items = list.filter((t) => t.status === col.key).sort((a, b) => a.due.localeCompare(b.due));
            return (
              <section key={col.key} className="rounded-2xl bg-slate-200/50 p-3" aria-label={col.label}>
                <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: col.dot }} />{col.label}<span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{items.length}</span></h2>
                <div className="space-y-2.5">
                  {items.map((t) => {
                    const late = isOverdue(t.due, t.status); const cust = customers.find((c) => c.id === t.customerId);
                    return (
                      <article key={t.id} className={cn('card p-4', late && 'border-coral-100')}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => setStatus(t, t.status === 'done' ? 'todo' : 'done')} aria-label={t.status === 'done' ? 'Reopen task' : 'Complete task'} className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition', t.status === 'done' ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 hover:border-brand-400')}>{t.status === 'done' && <Check className="h-3 w-3" />}</button>
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-sm font-bold', t.status === 'done' && 'text-slate-400 line-through')}>{t.title}</p>
                            {t.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>}
                            {cust && <p className="mt-1 text-xs font-semibold text-brand-600">{cust.company}</p>}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2"><Badge tone={priorityTone[t.priority]}>{t.priority}</Badge><span className={cn('inline-flex items-center gap-1 text-xs font-semibold', late ? 'text-coral-600' : 'text-slate-500')}><Calendar className="h-3.5 w-3.5" />{relativeDay(t.due)}</span></div>
                          <Avatar name={memberName(t.assignee)} size="xs" />
                        </div>
                        <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3">
                          <select value={t.status} onChange={(e) => setStatus(t, e.target.value as TaskStatus)} aria-label="Change status" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">{TASK_STATUSES.map((s) => <option key={s} value={s}>{cols.find((c) => c.key === s)!.label}</option>)}</select>
                          <button onClick={() => setForm({ task: t })} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-900" aria-label={`Edit ${t.title}`}><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleting(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-coral-50 hover:text-coral-600" aria-label={`Delete ${t.title}`}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </article>
                    );
                  })}
                  {items.length === 0 && <p className="rounded-xl border-2 border-dashed border-slate-300/70 px-3 py-6 text-center text-xs font-medium text-slate-400">Nothing here</p>}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <TaskForm open={!!form} initial={form?.task} onClose={() => setForm(null)} />
      {deleting && <ConfirmDialog title="Delete task?" message={`“${deleting.title}” will be removed.`} onClose={() => setDeleting(undefined)} onConfirm={() => { dispatch(tasksSlice.actions.removed(deleting.id)); toast('Task deleted', 'info'); }} />}
    </div>
  );
}
