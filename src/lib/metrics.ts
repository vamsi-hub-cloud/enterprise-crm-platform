import type { Activity, ActivityType, Dataset, DealStage, Deal, Lead } from '@/types';
import { ACTIVITY_TYPES, DEAL_STAGES, LEAD_SOURCES, LEAD_STATUSES } from '@/types';
import { pct } from './format';

export const isOpen = (d: Deal) => d.stage !== 'Won' && d.stage !== 'Lost';
export const openPipeline = (deals: Deal[]) => deals.filter(isOpen).reduce((s, d) => s + d.value, 0);
export const weightedPipeline = (deals: Deal[]) =>
  Math.round(deals.filter(isOpen).reduce((s, d) => s + (d.value * d.probability) / 100, 0));
export const wonRevenue = (deals: Deal[]) => deals.filter((d) => d.stage === 'Won').reduce((s, d) => s + d.value, 0);
export const winRate = (deals: Deal[]) => {
  const won = deals.filter((d) => d.stage === 'Won').length;
  const lost = deals.filter((d) => d.stage === 'Lost').length;
  return pct(won, won + lost);
};
export const leadConversion = (leads: Lead[]) => pct(leads.filter((l) => l.status === 'Converted').length, leads.length);
export const avgDealSize = (deals: Deal[]) => {
  const won = deals.filter((d) => d.stage === 'Won');
  return won.length ? Math.round(won.reduce((s, d) => s + d.value, 0) / won.length) : 0;
};
export const stageTotals = (deals: Deal[]) =>
  DEAL_STAGES.map((stage: DealStage) => {
    const list = deals.filter((d) => d.stage === stage);
    return { stage, count: list.length, value: list.reduce((s, d) => s + d.value, 0) };
  });
export const sourceBreakdown = (leads: Lead[]) =>
  LEAD_SOURCES.map((name) => ({ name, value: leads.filter((l) => l.source === name).length })).filter((x) => x.value > 0);
export const funnel = (leads: Lead[]) =>
  LEAD_STATUSES.filter((s) => s !== 'Unqualified').map((status) => ({
    status, count: leads.filter((l) => l.status === status).length,
  }));
export const activityCounts = (acts: Activity[]) =>
  ACTIVITY_TYPES.map((type: ActivityType) => ({ type, count: acts.filter((a) => a.type === type).length }));

export const ownerStats = (data: Dataset, ownerId: string) => {
  const deals = data.deals.filter((d) => d.owner === ownerId);
  const won = deals.filter((d) => d.stage === 'Won');
  const lost = deals.filter((d) => d.stage === 'Lost');
  return {
    leads: data.leads.filter((l) => l.owner === ownerId).length,
    openDeals: deals.filter(isOpen).length,
    wonCount: won.length,
    won: won.reduce((s, d) => s + d.value, 0),
    winRate: pct(won.length, won.length + lost.length),
    openTasks: data.tasks.filter((t) => t.assignee === ownerId && t.status !== 'done').length,
  };
};
