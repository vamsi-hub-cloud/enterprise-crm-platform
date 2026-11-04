import { NavLink } from 'react-router-dom';
import { Activity, BarChart3, Building2, CalendarDays, CheckSquare, KanbanSquare, LayoutDashboard, UserPlus, UsersRound, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CURRENT_USER } from '@/data/seed';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebar } from '@/store/slices/uiSlice';
import Avatar from '../ui/Avatar';

const groups = [
  { title: 'Workspace', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: UserPlus },
    { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
    { to: '/customers', label: 'Customers', icon: Building2 },
  ] },
  { title: 'Productivity', items: [
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/activities', label: 'Activities', icon: Activity },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  ] },
  { title: 'Insights', items: [
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/team', label: 'Team', icon: UsersRound },
  ] },
];

export default function Sidebar() {
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(setSidebar(false));
  return (
    <>
      {open && <div className="fixed inset-0 z-30 animate-fade bg-ink-950/50 lg:hidden" onClick={close} />}
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-900 text-slate-300 transition-transform duration-200 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')} aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden><rect width="32" height="32" rx="9" fill="#17324A" /><path d="M16 5l3.2 8.3L27 16l-7.8 2.7L16 27l-3.2-8.3L5 16l7.8-2.7z" fill="#2FAE9B" /></svg>
            <span className="text-lg font-extrabold tracking-tight text-white">Northstar</span>
          </div>
          <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-ink-800 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-2 px-3 text-xs font-semibold text-ink-600">{g.title}</p>
              <ul className="space-y-0.5">
                {g.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink to={to} end={to === '/'} onClick={close}
                      className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-brand-500/15 text-white shadow-[inset_3px_0_0_#2FAE9B]' : 'hover:bg-ink-800 hover:text-white')}>
                      <Icon className="h-[18px] w-[18px]" />{label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-xl bg-ink-800 p-3">
          <Avatar name={CURRENT_USER.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{CURRENT_USER.name}</p>
            <p className="truncate text-xs text-slate-400">{CURRENT_USER.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
