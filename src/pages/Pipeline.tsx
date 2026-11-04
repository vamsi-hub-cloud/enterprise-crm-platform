import { useState } from 'react';
import { CalendarDays, GripVertical, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { dealsSlice } from '@/store/slices/entities';
import { DEAL_STAGES, type Deal, type DealStage } from '@/types';
import { memberName } from '@/data/seed';
import { isOpen, openPipeline, weightedPipeline } from '@/lib/metrics';
import { money, relativeDay } from '@/lib/format';
import { stageColor, stageProb } from '@/lib/meta';
import { cn } from '@/lib/cn';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DealForm from '@/components/forms/DealForm';

export default function Pipeline() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const deals = useAppSelector((s) => s.deals.items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<DealStage | null>(null);
  const [form, setForm] = useState<{ deal?: Deal; stage?: DealStage } | null>(null);
  const [deleting, setDeleting] = useState<Deal | undefined>();

  const move = (id: string, stage: DealStage) => {
    const d = deals.find((x) => x.id === id);
    if (!d || d.stage === stage) return;
    dispatch(dealsSlice.actions.updated({ ...d, stage, probability: stageProb[stage] }));
    toast(stage === 'Won' ? `${d.title} won — nice work!` : `${d.title} moved to ${stage}`, stage === 'Lost' ? 'info' : 'success');
  };

  return (
    <div>
      <PageHeader title="Sales pipeline" subtitle="Drag deals between stages, or use the stage menu on a card."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setForm({})}>New deal</Button>} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Open deals', String(deals.filter(isOpen).length)], ['Pipeline value', money(openPipeline(deals), true)], ['Weighted forecast', money(weightedPipeline(deals), true)], ['Closing in 14 days', String(deals.filter((d) => isOpen(d) && d.closeDate <= new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10)).length)]].map(([l, v]) => (
          <div key={l} className="card px-4 py-3"><p className="text-xs font-medium text-slate-500">{l}</p><p className="text-xl font-extrabold">{v}</p></div>
        ))}
      </div>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {DEAL_STAGES.map((stage) => {
          const list = deals.filter((d) => d.stage === stage);
          const total = list.reduce((s, d) => s + d.value, 0);
          return (
            <section key={stage} aria-label={stage}
              onDragOver={(e) => { e.preventDefault(); setOver(stage); }} onDragLeave={() => setOver(null)}
              onDrop={() => { if (dragId) move(dragId, stage); setDragId(null); setOver(null); }}
              className={cn('flex w-72 shrink-0 snap-start flex-col rounded-2xl bg-slate-200/50 p-3 transition xl:w-auto xl:min-w-[210px] xl:flex-1', over === stage && 'bg-brand-100/70 ring-2 ring-brand-300')}>
              <header className="mb-3 px-1">
                <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: stageColor[stage] }} />{stage}</h3><span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600">{list.length}</span></div>
                <p className="mt-1 text-xs font-semibold text-slate-500">{money(total, true)}</p>
              </header>
              <div className="flex-1 space-y-2.5">
                {list.map((d) => (
                  <article key={d.id} draggable onDragStart={() => setDragId(d.id)} onDragEnd={() => { setDragId(null); setOver(null); }}
                    className={cn('card cursor-grab p-3.5 active:cursor-grabbing', dragId === d.id && 'opacity-40')}>
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <button onClick={() => setForm({ deal: d })} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold">{d.title}</p><p className="truncate text-xs text-slate-500">{d.company}</p>
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between"><span className="text-base font-extrabold">{money(d.value)}</span><span className="text-xs font-semibold text-slate-500">{d.probability}%</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${d.probability}%`, background: stageColor[d.stage] }} /></div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{relativeDay(d.closeDate)}</span>
                      <Avatar name={memberName(d.owner)} size="xs" />
                    </div>
                    <select value={d.stage} onChange={(e) => move(d.id, e.target.value as DealStage)} aria-label={`Move ${d.title} to stage`} className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                      {DEAL_STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </article>
                ))}
                {list.length === 0 && <p className="rounded-xl border-2 border-dashed border-slate-300/70 px-3 py-6 text-center text-xs font-medium text-slate-400">Drop a deal here</p>}
              </div>
              <button onClick={() => setForm({ stage })} className="mt-3 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:bg-white/70 hover:text-ink-900"><Plus className="h-3.5 w-3.5" />Add deal</button>
            </section>
          );
        })}
      </div>

      <DealForm open={!!form} initial={form?.deal} stage={form?.stage} onClose={() => setForm(null)} />
      {form?.deal && (
        <div className="fixed bottom-4 left-1/2 z-[55] -translate-x-1/2">
          <Button variant="danger" size="sm" onClick={() => { setDeleting(form.deal); setForm(null); }}>Delete this deal</Button>
        </div>
      )}
      {deleting && <ConfirmDialog title="Delete deal?" message={`“${deleting.title}” will be removed from the pipeline.`} onClose={() => setDeleting(undefined)} onConfirm={() => { dispatch(dealsSlice.actions.removed(deleting.id)); toast('Deal deleted', 'info'); }} />}
    </div>
  );
}
