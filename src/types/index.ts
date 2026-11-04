export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'] as const;
export const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Event', 'Cold Outreach', 'Partner'] as const;
export const DEAL_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const TIERS = ['Enterprise', 'Growth', 'Starter'] as const;
export const ACTIVITY_TYPES = ['call', 'meeting', 'email', 'followup', 'note'] as const;
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Tier = (typeof TIERS)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Member { id: string; name: string; role: string }
export interface Lead {
  id: string; name: string; company: string; email: string; phone: string;
  source: LeadSource; status: LeadStatus; value: number; owner: string; createdAt: string; notes: string;
}
export interface Deal {
  id: string; title: string; company: string; customerId?: string; stage: DealStage;
  value: number; probability: number; closeDate: string; owner: string;
}
export interface Customer {
  id: string; name: string; company: string; email: string; phone: string; industry: string;
  tier: Tier; city: string; revenue: number; owner: string; since: string; notes: string;
}
export interface Task {
  id: string; title: string; description: string; assignee: string; priority: Priority;
  due: string; status: TaskStatus; customerId?: string;
}
export interface Activity {
  id: string; type: ActivityType; subject: string; customerId?: string; date: string; time: string;
  owner: string; notes: string; done: boolean;
}
export interface Dataset {
  leads: Lead[]; deals: Deal[]; customers: Customer[]; tasks: Task[]; activities: Activity[];
}
export interface ToastMsg { id: string; type: 'success' | 'error' | 'info'; message: string }
