import { CalendarClock, Mail, PhoneCall, StickyNote, Video, type LucideIcon } from 'lucide-react';
import type { ActivityType, DealStage, LeadStatus, Priority } from '@/types';

export type Tone = 'slate' | 'teal' | 'coral' | 'gold' | 'blue' | 'violet' | 'green' | 'red';

export const leadTone: Record<LeadStatus, Tone> = {
  New: 'blue', Contacted: 'violet', Qualified: 'teal', Unqualified: 'slate', Converted: 'green',
};
export const stageTone: Record<DealStage, Tone> = {
  Prospecting: 'slate', Qualification: 'blue', Proposal: 'violet', Negotiation: 'gold', Won: 'green', Lost: 'red',
};
export const stageProb: Record<DealStage, number> = {
  Prospecting: 10, Qualification: 30, Proposal: 55, Negotiation: 80, Won: 100, Lost: 0,
};
export const stageColor: Record<DealStage, string> = {
  Prospecting: '#94A3B8', Qualification: '#38BDF8', Proposal: '#8B5CF6', Negotiation: '#F0B84B', Won: '#16907F', Lost: '#EF6C4D',
};
export const priorityTone: Record<Priority, Tone> = { Low: 'slate', Medium: 'blue', High: 'gold', Urgent: 'coral' };

export const activityMeta: Record<ActivityType, { label: string; icon: LucideIcon; tone: Tone; color: string }> = {
  call: { label: 'Call', icon: PhoneCall, tone: 'teal', color: '#16907F' },
  meeting: { label: 'Meeting', icon: Video, tone: 'violet', color: '#8B5CF6' },
  email: { label: 'Email', icon: Mail, tone: 'blue', color: '#38BDF8' },
  followup: { label: 'Follow-up', icon: CalendarClock, tone: 'gold', color: '#F0B84B' },
  note: { label: 'Note', icon: StickyNote, tone: 'slate', color: '#94A3B8' },
};

export const toneClass: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  teal: 'bg-brand-50 text-brand-700',
  coral: 'bg-coral-50 text-coral-600',
  gold: 'bg-gold-50 text-gold-600',
  blue: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
};
