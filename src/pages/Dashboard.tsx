import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarCheck2, CircleDollarSign, Percent, Target, TrendingUp } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { CURRENT_USER, QUARTER_TARGET, TEAM, buildRevenueTrend, memberName } from '@/data/seed';
import { funnel, openPipeline, ownerStats, sourceBreakdown, stageTotals, weightedPipeline, winRate, wonRevenue, leadConversion } from '@/lib/metrics';
import { isOverdue, money, pct, relativeDay, shortDate, todayISO } from '@/lib/format';
import { activityMeta, priorityTone, stageColor } from '@/lib/meta';
import { SOURCE_COLORS, axisProps, tooltipStyle } from '@/lib/chart';
import StatCard from '@/components/ui/StatCard';
import ChartCard from '@/components/ui/ChartCard';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

export default function Dashboard() {
  const leads = useAppSelector((s) => s.leads.items);
  const deals = useAppSelector((s) => s.deals.items);
  const customers = useAppSelector((s) => s.customers.items);
  const tasks = useAppSelector((s) => s.tasks.items);
  const activities = useAppSelector((s) => s.activities.items);
  const trend = useMemo(buildRevenueTrend, []);

  const won = wonRevenue(deals);
  const progress = Math.min(100, pct(won, QUARTER_TARGET));
  const today = todayISO();
  const dueToday = tasks.filter((t) => t.due === today && t.status !== 'done').length;
  const overdue = tasks.filter((t) => isOverdue(t.due, t.status)).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const upcoming = [...tasks].filter((t) => t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);
  const recent = [...activities].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).filter((a) => a.date <= today).slice(0, 5);
  const board = TEAM.map((m) => ({ m, ...ownerStats({ leads, deals, customers, tasks, activities }, m.id) })).sort((a, b) => b.won - a.won);
  const topWon = Math.max(1, board[0]?.won ?? 1);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greet}, {CURRENT_USER.name.split(' ')[0]}.</h1>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              You have <strong className="text-white">{dueToday} task{dueToday === 1 ? '' : 's'} due today</strong>
              {overdue > 0 && <> and <strong className="text-gold-400">{overdue} overdue</strong></>}. {deals.filter((d) => d.stage === 'Negotiation').length} deals are in negotiation.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/tasks" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold hover:bg-brand-400">Review tasks</Link>
              <Link to="/pipeline" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">Open pipeline</Link>
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Quarter target</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">{money(won, true)} <span className="text-base font-semibold text-slate-400">of {money(QUARTER_TARGET, true)}</span></p>
              </div>
              <p className="text-2xl font-extrabold text-gold-400">{progress}%</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Quarter target progress">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-gold-400 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open pipeline" value={money(openPipeline(deals), true)} hint={`${money(weightedPipeline(deals), true)} weighted`} icon={CircleDollarSign} />
        <StatCard label="Revenue won" value={money(won, true)} hint={`${deals.filter((d) => d.stage === 'Won').length} deals closed`} icon={TrendingUp} tone="gold" />
        <StatCard label="Lead conversion" value={`${leadConversion(leads)}%`} hint={`${leads.filter((l) => l.status === 'Converted').length} of ${leads.length} leads`} icon={Percent} tone="violet" />
        <StatCard label="Win rate" value={`${winRate(deals)}%`} hint="Won vs lost deals" icon={Target} tone="coral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue vs target" subtitle="Last 12 months" className="lg:col-span-2">
          <div className="h-64"><ResponsiveContainer>
            <AreaChart data={trend} margin={{ left: -12, right: 8, top: 8 }}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16907F" stopOpacity={0.35} /><stop offset="100%" stopColor="#16907F" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="month" {...axisProps} /><YAxis {...axisProps} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} />
              <Area type="monotone" dataKey="target" stroke="#F0B84B" strokeWidth={2} strokeDasharray="5 4" fill="none" name="Target" />
              <Area type="monotone" dataKey="revenue" stroke="#16907F" strokeWidth={3} fill="url(#rev)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Where leads come from" subtitle="By source">
          <div className="h-48"><ResponsiveContainer>
            <PieChart><Pie data={sourceBreakdown(leads)} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">
              {sourceBreakdown(leads).map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
            </Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
          </ResponsiveContainer></div>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {sourceBreakdown(leads).map((s, i) => <li key={s.name} className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />{s.name} <b className="ml-auto text-ink-900">{s.value}</b></li>)}
          </ul>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Pipeline by stage" subtitle="Deal value in each stage">
          <div className="h-60"><ResponsiveContainer>
            <BarChart data={stageTotals(deals)} margin={{ left: -12, right: 8 }}>
              <CartesianGrid vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="stage" {...axisProps} interval={0} tick={{ fontSize: 11, fill: '#64748b' }} /><YAxis {...axisProps} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => money(v)} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Value">{stageTotals(deals).map((s) => <Cell key={s.stage} fill={stageColor[s.stage]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Lead conversion funnel" subtitle="How leads move toward customers">
          <div className="h-60"><ResponsiveContainer>
            <BarChart data={funnel(leads)} layout="vertical" margin={{ left: 12, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="#eef2f6" />
              <XAxis type="number" {...axisProps} allowDecimals={false} /><YAxis type="category" dataKey="status" {...axisProps} width={80} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#2FAE9B" name="Leads" barSize={26} />
            </BarChart>
          </ResponsiveContainer></div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Up next</h3><Link to="/tasks" className="text-xs font-semibold text-brand-600 hover:underline">All tasks</Link></div>
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <CalendarCheck2 className={`mt-0.5 h-4 w-4 shrink-0 ${isOverdue(t.due, t.status) ? 'text-coral-500' : 'text-brand-500'}`} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.title}</p><p className={`text-xs ${isOverdue(t.due, t.status) ? 'font-semibold text-coral-600' : 'text-slate-500'}`}>{relativeDay(t.due)} · {memberName(t.assignee)}</p></div>
                <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Recent activity</h3><Link to="/activities" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link></div>
          <ul className="space-y-3">
            {recent.map((a) => { const m = activityMeta[a.type]; const c = customers.find((x) => x.id === a.customerId); return (
              <li key={a.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${m.color}1f`, color: m.color }}><m.icon className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{a.subject}</p><p className="text-xs text-slate-500">{c?.company ?? 'General'} · {shortDate(a.date)}</p></div>
              </li>); })}
          </ul>
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Top performers</h3><Link to="/team" className="text-xs font-semibold text-brand-600 hover:underline">Team</Link></div>
          <ul className="space-y-4">
            {board.slice(0, 5).map((b) => (
              <li key={b.m.id} className="flex items-center gap-3">
                <Avatar name={b.m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm"><span className="truncate font-semibold">{b.m.name}</span><span className="font-bold">{money(b.won, true)}</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-400" style={{ width: `${(b.won / topWon) * 100}%` }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
