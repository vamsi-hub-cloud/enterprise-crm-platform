import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { leadsSlice, dealsSlice, tasksSlice } from '@/store/slices/entities';
import { loadData } from '@/store/thunks';
import { buildSeed } from '@/data/seed';
import { validateLead, validateTask, validateDeal, validateActivity, validateCustomer, isEmail } from '@/lib/validators';
import { leadConversion, openPipeline, weightedPipeline, winRate, ownerStats } from '@/lib/metrics';
import { money, pct, isOverdue, toISO, addDays } from '@/lib/format';
import type { Lead } from '@/types';

const lead: Lead = { id: 'x1', name: 'Test Person', company: 'Acme', email: 'a@b.co', phone: '', source: 'Website', status: 'New', value: 1000, owner: 'u1', createdAt: '2026-01-01', notes: '' };

describe('store', () => {
  it('hydrates from loadData.fulfilled', () => {
    const store = makeStore();
    store.dispatch({ type: loadData.fulfilled.type, payload: buildSeed() });
    expect(store.getState().leads.items.length).toBeGreaterThan(5);
    expect(store.getState().ui.status).toBe('ready');
  });
  it('shows an error state when loading is rejected', () => {
    const store = makeStore();
    store.dispatch({ type: loadData.rejected.type, payload: 'boom' });
    expect(store.getState().ui.status).toBe('error');
    expect(store.getState().ui.error).toBe('boom');
  });
  it('adds, updates and removes a lead', () => {
    const store = makeStore();
    store.dispatch(leadsSlice.actions.added(lead));
    expect(store.getState().leads.items[0].name).toBe('Test Person');
    store.dispatch(leadsSlice.actions.updated({ ...lead, status: 'Qualified' }));
    expect(store.getState().leads.items[0].status).toBe('Qualified');
    store.dispatch(leadsSlice.actions.removed('x1'));
    expect(store.getState().leads.items).toHaveLength(0);
  });
  it('moves a deal between stages and completes a task', () => {
    const store = makeStore();
    const seed = buildSeed();
    store.dispatch({ type: loadData.fulfilled.type, payload: seed });
    const d = seed.deals[0];
    store.dispatch(dealsSlice.actions.updated({ ...d, stage: 'Won', probability: 100 }));
    expect(store.getState().deals.items.find((x) => x.id === d.id)?.stage).toBe('Won');
    const t = seed.tasks[0];
    store.dispatch(tasksSlice.actions.updated({ ...t, status: 'done' }));
    expect(store.getState().tasks.items.find((x) => x.id === t.id)?.status).toBe('done');
  });
});

describe('validators', () => {
  it('requires lead fields and a valid email', () => {
    const e = validateLead({ name: '', company: '', email: 'nope', phone: 'abc', value: '-5' });
    expect(e.name).toBeTruthy(); expect(e.company).toBeTruthy(); expect(e.email).toBeTruthy(); expect(e.phone).toBeTruthy(); expect(e.value).toBeTruthy();
  });
  it('accepts a valid lead', () => {
    const e = validateLead({ name: 'A', company: 'B', email: 'a@b.com', phone: '+1 555 0100', value: '100' });
    expect(Object.values(e).filter(Boolean)).toHaveLength(0);
  });
  it('validates tasks, deals, activities and customers', () => {
    expect(validateTask({ title: '', due: '' }).title).toBeTruthy();
    expect(validateDeal({ title: 'x', company: 'y', closeDate: '2026-01-01', value: '' }).value).toBeTruthy();
    expect(validateActivity({ subject: '', date: '', time: '' }).subject).toBeTruthy();
    expect(validateCustomer({ name: 'a', company: 'b', city: '', email: 'a@b.com', revenue: '0' }).city).toBeTruthy();
    expect(isEmail('a@b.com')).toBe(true);
  });
});

describe('metrics & format', () => {
  const seed = buildSeed();
  it('computes pipeline and win rate', () => {
    expect(openPipeline(seed.deals)).toBeGreaterThan(0);
    expect(weightedPipeline(seed.deals)).toBeLessThan(openPipeline(seed.deals));
    expect(winRate(seed.deals)).toBe(pct(3, 5));
  });
  it('computes lead conversion and owner stats', () => {
    expect(leadConversion(seed.leads)).toBe(pct(3, seed.leads.length));
    expect(ownerStats(seed, 'u1').openTasks).toBeGreaterThanOrEqual(0);
  });
  it('formats currency and detects overdue dates', () => {
    expect(money(1500)).toBe('$1,500');
    expect(isOverdue(toISO(addDays(new Date(), -2)), 'todo')).toBe(true);
    expect(isOverdue(toISO(addDays(new Date(), -2)), 'done')).toBe(false);
  });
});
