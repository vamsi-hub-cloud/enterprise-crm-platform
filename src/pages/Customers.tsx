import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Plus } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { TIERS, type Tier } from '@/types';
import { memberName } from '@/data/seed';
import { money } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Chip from '@/components/ui/Chip';
import SearchBox from '@/components/ui/SearchBox';
import EmptyState from '@/components/ui/EmptyState';
import CustomerForm from '@/components/forms/CustomerForm';

const tierTone = { Enterprise: 'violet', Growth: 'teal', Starter: 'slate' } as const;

export default function Customers() {
  const customers = useAppSelector((s) => s.customers.items);
  const deals = useAppSelector((s) => s.deals.items);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState<Tier | 'All'>('All');
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers.filter((c) => (tier === 'All' || c.tier === tier) && (!s || [c.company, c.name, c.industry, c.city].some((x) => x.toLowerCase().includes(s))));
  }, [customers, q, tier]);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} accounts · ${money(customers.reduce((s, c) => s + c.revenue, 0), true)} lifetime revenue`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>New customer</Button>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search company, contact, city" />
        <div className="flex gap-2 overflow-x-auto"><Chip active={tier === 'All'} onClick={() => setTier('All')}>All tiers</Chip>{TIERS.map((t) => <Chip key={t} active={tier === t} onClick={() => setTier(t)}>{t}</Chip>)}</div>
      </div>

      {list.length === 0 ? <div className="card"><EmptyState icon={Building2} title="No customers found" text="Adjust your search or add a new customer account." action={<Button onClick={() => setCreating(true)}>Add customer</Button>} /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const open = deals.filter((d) => d.customerId === c.id && d.stage !== 'Won' && d.stage !== 'Lost').length;
            return (
              <Link key={c.id} to={`/customers/${c.id}`} className="card group block p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3"><Avatar name={c.company} size="lg" /><div className="min-w-0"><h3 className="truncate font-bold group-hover:text-brand-600">{c.company}</h3><p className="truncate text-sm text-slate-500">{c.name}</p></div></div>
                  <Badge tone={tierTone[c.tier]}>{c.tier}</Badge>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span className="truncate">{c.email}</span></p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{c.city} · {c.industry}</p>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div><p className="text-xs text-slate-500">Lifetime revenue</p><p className="text-lg font-extrabold">{money(c.revenue, true)}</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500">{open} open deal{open === 1 ? '' : 's'}</p><p className="text-xs font-semibold text-slate-600">{memberName(c.owner)}</p></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <CustomerForm open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
