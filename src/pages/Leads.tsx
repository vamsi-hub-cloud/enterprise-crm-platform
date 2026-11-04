import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, Mail, Pencil, Phone, Plus, Trash2, UserCheck, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { customersSlice, leadsSlice } from '@/store/slices/entities';
import { LEAD_SOURCES, LEAD_STATUSES, type Customer, type Lead, type LeadStatus } from '@/types';
import { memberName } from '@/data/seed';
import { money, shortDate, todayISO, uid } from '@/lib/format';
import { leadTone } from '@/lib/meta';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Chip from '@/components/ui/Chip';
import SearchBox from '@/components/ui/SearchBox';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LeadForm from '@/components/forms/LeadForm';

type SortKey = 'createdAt' | 'value' | 'name';
const PAGE_SIZE = 8;

export default function Leads() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const leads = useAppSelector((s) => s.leads.items);

  const [q, setQ] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState<LeadStatus | 'All'>('All');
  const [source, setSource] = useState('All');
  const [sort, setSort] = useState<SortKey>('createdAt');
  const [dir, setDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Lead | undefined>();
  const [creating, setCreating] = useState(params.get('new') === '1');
  const [deleting, setDeleting] = useState<Lead | undefined>();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return leads
      .filter((l) => (status === 'All' || l.status === status) && (source === 'All' || l.source === source) && (!s || [l.name, l.company, l.email].some((x) => x.toLowerCase().includes(s))))
      .sort((a, b) => (sort === 'value' ? a.value - b.value : String(a[sort]).localeCompare(String(b[sort]))) * dir);
  }, [leads, q, status, source, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice((Math.min(page, pages) - 1) * PAGE_SIZE, Math.min(page, pages) * PAGE_SIZE);
  const toggleSort = (k: SortKey) => { if (sort === k) setDir((d) => (d === 1 ? -1 : 1)); else { setSort(k); setDir(k === 'name' ? 1 : -1); } };
  const closeForm = () => { setCreating(false); setEditing(undefined); if (params.has('new')) { params.delete('new'); setParams(params, { replace: true }); } };

  const setLeadStatus = (l: Lead, next: LeadStatus) => { dispatch(leadsSlice.actions.updated({ ...l, status: next })); toast(`${l.name} marked ${next.toLowerCase()}`); };
  const convert = (l: Lead) => {
    const c: Customer = { id: uid(), name: l.name, company: l.company, email: l.email, phone: l.phone, industry: 'General', tier: 'Starter', city: 'Not set', revenue: 0, owner: l.owner, since: todayISO(), notes: l.notes };
    dispatch(customersSlice.actions.added(c));
    dispatch(leadsSlice.actions.updated({ ...l, status: 'Converted' }));
    toast(`${l.company} is now a customer`);
    nav(`/customers/${c.id}`);
  };

  const counts = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
  const Actions = ({ l }: { l: Lead }) => (
    <div className="flex items-center justify-end gap-1">
      {l.status !== 'Converted' && <Button size="sm" variant="soft" icon={<UserCheck className="h-3.5 w-3.5" />} onClick={() => convert(l)}>Convert</Button>}
      <button onClick={() => setEditing(l)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink-900" aria-label={`Edit ${l.name}`}><Pencil className="h-4 w-4" /></button>
      <button onClick={() => setDeleting(l)} className="rounded-lg p-2 text-slate-400 hover:bg-coral-50 hover:text-coral-600" aria-label={`Delete ${l.name}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  );
  const StatusSelect = ({ l }: { l: Lead }) => (
    <select value={l.status} onChange={(e) => setLeadStatus(l, e.target.value as LeadStatus)} aria-label={`Status for ${l.name}`} className="cursor-pointer rounded-full border-0 bg-transparent p-0 text-xs font-semibold focus:ring-0">
      {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${leads.length} leads · ${money(leads.filter((l) => l.status !== 'Converted' && l.status !== 'Unqualified').reduce((s, l) => s + l.value, 0), true)} in active potential`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>New lead</Button>} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LEAD_STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(status === s ? 'All' : s); setPage(1); }} className={`card p-4 text-left transition hover:-translate-y-0.5 ${status === s ? 'ring-2 ring-brand-400' : ''}`}>
            <Badge tone={leadTone[s]}>{s}</Badge><p className="mt-2 text-2xl font-extrabold">{counts(s)}</p>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, company or email" />
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Chip active={source === 'All'} onClick={() => { setSource('All'); setPage(1); }}>All sources</Chip>
            {LEAD_SOURCES.map((s) => <Chip key={s} active={source === s} onClick={() => { setSource(s); setPage(1); }}>{s}</Chip>)}
          </div>
        </div>

        {view.length === 0 ? (
          <EmptyState icon={UserPlus} title={leads.length ? 'No leads match these filters' : 'No leads yet'} text={leads.length ? 'Try a different search or clear the filters.' : 'Add your first lead to start tracking your sales funnel.'}
            action={<Button onClick={() => leads.length ? (setQ(''), setStatus('All'), setSource('All')) : setCreating(true)}>{leads.length ? 'Clear filters' : 'Add a lead'}</Button>} />
        ) : (<>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50/70"><tr>
                <th className="th"><button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1">Lead <ArrowDownUp className="h-3 w-3" /></button></th>
                <th className="th">Source</th><th className="th">Status</th>
                <th className="th"><button onClick={() => toggleSort('value')} className="inline-flex items-center gap-1">Value <ArrowDownUp className="h-3 w-3" /></button></th>
                <th className="th">Owner</th>
                <th className="th"><button onClick={() => toggleSort('createdAt')} className="inline-flex items-center gap-1">Added <ArrowDownUp className="h-3 w-3" /></button></th>
                <th className="th" />
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {view.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={l.name} size="sm" /><div><p className="font-semibold">{l.name}</p><p className="text-xs text-slate-500">{l.company}</p></div></div></td>
                    <td className="px-4 py-3 text-slate-600">{l.source}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 ${'bg-slate-100'}`}><StatusSelect l={l} /></span></td>
                    <td className="px-4 py-3 font-bold">{money(l.value)}</td>
                    <td className="px-4 py-3 text-slate-600">{memberName(l.owner)}</td>
                    <td className="px-4 py-3 text-slate-500">{shortDate(l.createdAt)}</td>
                    <td className="px-4 py-3"><Actions l={l} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-slate-100 md:hidden">
            {view.map((l) => (
              <li key={l.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><Avatar name={l.name} /><div><p className="font-bold">{l.name}</p><p className="text-sm text-slate-500">{l.company}</p></div></div>
                  <Badge tone={leadTone[l.status]}>{l.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span></div>
                <div className="flex items-center justify-between"><span className="font-bold">{money(l.value)}</span><span className="rounded-full bg-slate-100 px-2 py-0.5"><StatusSelect l={l} /></span></div>
                <Actions l={l} />
              </li>
            ))}
          </ul>
          <Pagination page={Math.min(page, pages)} pages={pages} total={filtered.length} onChange={setPage} />
        </>)}
      </div>

      <LeadForm open={creating || !!editing} initial={editing} onClose={closeForm} />
      {deleting && <ConfirmDialog title="Delete lead?" message={`${deleting.name} from ${deleting.company} will be removed permanently.`} onClose={() => setDeleting(undefined)} onConfirm={() => { dispatch(leadsSlice.actions.removed(deleting.id)); toast('Lead deleted', 'info'); }} />}
    </div>
  );
}
