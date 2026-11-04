import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleDollarSign, Gauge, Percent, Trophy } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { TEAM, buildRevenueTrend } from '@/data/seed';
import { activityCounts, avgDealSize, leadConversion, ownerStats, sourceBreakdown, stageTotals, weightedPipeline, winRate } from '@/lib/metrics';
import { money, pct } from '@/lib/format';
import { activityMeta, stageColor } from '@/lib/meta';
import { SOURCE_COLORS, axisProps, tooltipStyle } from '@/lib/chart';
import { LEAD_SOURCES } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import ChartCard from '@/components/ui/ChartCard';

export default function Analytics() {
  const leads = useAppSelector((s) => s.leads.items);
  const deals = useAppSelector((s) => s.deals.items);
  const customers = useAppSelector((s) => s.customers.items);
  const tasks = useAppSelector((s) => s.tasks.items);
  const activities = useAppSelector((s) => s.activities.items);
  const trend = useMemo(buildRevenueTrend, []);

  const owners = TEAM.map((m) => ({ name: m.name.split(' ')[0], ...ownerStats({ leads, deals, customers, tasks, activities }, m.id) }));
  const sources = LEAD_SOURCES.map((s) => { const l = leads.filter((x) => x.source === s); return { source: s, leads: l.length, converted: l.filter((x) => x.status === 'Converted').length, rate: pct(l.filter((x) => x.status === 'Converted').length, l.length) }; });
  const acts = activityCounts(activities).map((a) => ({ name: activityMeta[a.type].label, count: a.count, color: activityMeta[a.type].color }));
  const growth = Math.round(((trend[11].revenue - trend[0].revenue) / trend[0].revenue) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Sales performance, conversion and team activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="12-month growth" value={`+${growth}%`} hint="Revenue, first vs last month" icon={Gauge} />
        <StatCard label="Average deal size" value={money(avgDealSize(deals), true)} hint="Across won deals" icon={CircleDollarSign} tone="gold" />
        <StatCard label="Lead conversion" value={`${leadConversion(leads)}%`} hint={`${money(weightedPipeline(deals), true)} weighted forecast`} icon={Percent} tone="violet" />
        <StatCard label="Win rate" value={`${winRate(deals)}%`} hint="Closed deals only" icon={Trophy} tone="coral" />
      </div>

      <ChartCard title="Revenue against target" subtitle="Monthly revenue (bars) and target (line)">
        <div className="h-72"><ResponsiveContainer>
          <ComposedChart data={trend} margin={{ left: -12, right: 8 }}>
            <CartesianGrid vertical={false} stroke="#eef2f6" /><XAxis dataKey="month" {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} cursor={{ fill: '#f1f5f9' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#2FAE9B" radius={[6, 6, 0, 0]} barSize={22} /><Line dataKey="target" name="Target" stroke="#F0B84B" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer></div>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Won revenue by rep" subtitle="Closed-won deal value">
          <div className="h-64"><ResponsiveContainer><BarChart data={owners} margin={{ left: -12, right: 8 }}>
            <CartesianGrid vertical={false} stroke="#eef2f6" /><XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} cursor={{ fill: '#f1f5f9' }} /><Bar dataKey="won" name="Won" fill="#16907F" radius={[8, 8, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Deal value by stage" subtitle="Share of total pipeline and closed value">
          <div className="h-64"><ResponsiveContainer><PieChart>
            <Pie data={stageTotals(deals).filter((s) => s.value > 0)} dataKey="value" nameKey="stage" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">{stageTotals(deals).filter((s) => s.value > 0).map((s) => <Cell key={s.stage} fill={stageColor[s.stage]} />)}</Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Lead source performance" subtitle="Leads and conversions per channel">
          <div className="h-64"><ResponsiveContainer><BarChart data={sources} margin={{ left: -20, right: 8 }}>
            <CartesianGrid vertical={false} stroke="#eef2f6" /><XAxis dataKey="source" {...axisProps} interval={0} tick={{ fontSize: 10, fill: '#64748b' }} /><YAxis {...axisProps} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="leads" name="Leads" fill="#94A3B8" radius={[6, 6, 0, 0]} /><Bar dataKey="converted" name="Converted" fill="#16907F" radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Activity mix" subtitle="Customer touchpoints by type">
          <div className="h-64"><ResponsiveContainer><BarChart data={acts} layout="vertical" margin={{ left: 12, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="#eef2f6" /><XAxis type="number" {...axisProps} allowDecimals={false} /><YAxis type="category" dataKey="name" {...axisProps} width={70} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} /><Bar dataKey="count" name="Activities" radius={[0, 8, 8, 0]} barSize={22}>{acts.map((a) => <Cell key={a.name} fill={a.color} />)}</Bar>
          </BarChart></ResponsiveContainer></div>
        </ChartCard>
      </div>

      <section className="card overflow-hidden">
        <h3 className="px-5 pt-5 text-sm font-bold">Conversion by lead source</h3>
        <div className="overflow-x-auto"><table className="mt-3 w-full min-w-[480px] text-sm"><thead className="bg-slate-50/70"><tr><th className="th">Source</th><th className="th">Leads</th><th className="th">Converted</th><th className="th">Rate</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{sources.map((s, i) => <tr key={s.source}><td className="px-4 py-3 font-semibold"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLORS[i] }} />{s.source}</td><td className="px-4 py-3">{s.leads}</td><td className="px-4 py-3">{s.converted}</td>
            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-400" style={{ width: `${s.rate}%` }} /></div><b>{s.rate}%</b></div></td></tr>)}</tbody></table></div>
      </section>
      <p className="px-1 text-xs text-slate-400">Monthly revenue history is sample data; all other figures are calculated live from your leads, deals, tasks and activities. {sourceBreakdown(leads).length} active lead sources.</p>
    </div>
  );
}
