import { useAppSelector } from '@/store/hooks';
import { TEAM } from '@/data/seed';
import { ownerStats } from '@/lib/metrics';
import { money } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';

export default function Team() {
  const leads = useAppSelector((s) => s.leads.items);
  const deals = useAppSelector((s) => s.deals.items);
  const customers = useAppSelector((s) => s.customers.items);
  const tasks = useAppSelector((s) => s.tasks.items);
  const activities = useAppSelector((s) => s.activities.items);
  return (
    <div>
      <PageHeader title="Team" subtitle="Workload and results for everyone selling and supporting accounts." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TEAM.map((m) => { const s = ownerStats({ leads, deals, customers, tasks, activities }, m.id); return (
          <article key={m.id} className="card p-5">
            <div className="flex items-center gap-4"><Avatar name={m.name} size="lg" /><div><h2 className="font-bold">{m.name}</h2><p className="text-sm text-slate-500">{m.role}</p></div></div>
            <p className="mt-5 text-xs text-slate-500">Revenue won</p><p className="text-2xl font-extrabold">{money(s.won)}</p>
            <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 text-center">
              {[['Leads', s.leads], ['Open deals', s.openDeals], ['Win rate', `${s.winRate}%`], ['Open tasks', s.openTasks]].map(([l, v]) => <div key={l}><dd className="text-base font-extrabold">{v}</dd><dt className="text-[11px] text-slate-500">{l}</dt></div>)}
            </dl>
          </article>); })}
      </div>
    </div>
  );
}
