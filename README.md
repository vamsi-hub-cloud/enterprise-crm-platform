# Northstar CRM — Enterprise CRM Platform

A responsive CRM dashboard built with **React 18, TypeScript, Redux Toolkit, Tailwind CSS and Recharts** (Vite).

## Quick start
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm test           # unit tests (Vitest)
```

## Modules
| Area | What you can do |
| --- | --- |
| Dashboard | Quarter-target hero, KPI cards, revenue vs target, lead sources, pipeline by stage, conversion funnel, up-next tasks, recent activity, top performers |
| Leads | Create / edit / delete, inline status change, search, source + status filters, sorting, pagination, one-click **Convert to customer** |
| Pipeline | Kanban board with drag-and-drop (plus a stage menu for touch), stage totals, weighted forecast, add / edit / delete deals |
| Customers | Card grid with search and tier filter, **customer profile** with contact info, KPIs, interaction timeline, linked deals and tasks |
| Tasks | Board by status, assignee + priority filters, deadlines, overdue highlighting, create / edit / complete / delete |
| Activities | Calls, meetings, emails, notes and follow-ups on a dated timeline, type filters, mark follow-ups done |
| Calendar (extra) | Month view of task deadlines, activities and expected deal closes |
| Analytics (extra) | Revenue vs target, won revenue by rep, deal value by stage, source performance, activity mix |
| Team (extra) | Per-person revenue, leads, open deals, win rate, open tasks |
| Global search (extra) | Top-bar search across customers, leads and deals; overdue-task bell |

## Structure
```
src/
  components/ui/       Button, Modal, Fields, Badge, Avatar, Toaster, Skeleton, EmptyState, ...
  components/forms/    Lead, Customer, Deal, Task and Activity form modals (validated)
  components/layout/   Sidebar, Topbar, Layout (loading + error gate)
  pages/               One file per route
  store/               Redux Toolkit store, generic CRUD slice, UI slice, loadData thunk
  lib/                 formatters, validators, metrics, chart theme, label/colour maps
  data/seed.ts         Demo data (dates are relative to today)
  tests/               Vitest suites
```

## Notes
- **Data layer:** `loadData` in `src/store/thunks.ts` simulates an API call (with loading and error states). Changes persist in `localStorage`; replace the thunk body with real `fetch` calls to connect a backend. Clear the `northstar-crm-v1` key to reset the demo data.
- **Validation:** required fields, email/phone format and numeric checks, shown inline under each field.
- **Routing on hosts:** `vercel.json` and `public/_redirects` are included so deep links work on Vercel/Netlify.
- Monthly revenue history on the dashboard and analytics pages is sample data; everything else is computed from the store.
