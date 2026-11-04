import type { Activity, ActivityType, Customer, Dataset, Deal, DealStage, Lead, LeadSource, LeadStatus, Member, Priority, Task, TaskStatus, Tier } from '@/types';
import { addDays, toISO } from '@/lib/format';
import { stageProb } from '@/lib/meta';

const day = (n: number) => toISO(addDays(new Date(), n));

export const TEAM: Member[] = [
  { id: 'u1', name: 'Aarav Mehta', role: 'Sales Director' },
  { id: 'u2', name: 'Priya Nair', role: 'Senior Account Executive' },
  { id: 'u3', name: 'Daniel Cruz', role: 'Account Executive' },
  { id: 'u4', name: 'Sofia Rossi', role: 'Customer Success Lead' },
  { id: 'u5', name: 'Kenji Watanabe', role: 'Sales Development Rep' },
];
export const CURRENT_USER = TEAM[0];
export const memberName = (id: string) => TEAM.find((m) => m.id === id)?.name ?? 'Unassigned';

export const QUARTER_TARGET = 420000;

export function buildRevenueTrend() {
  const rev = [88, 94, 101, 97, 112, 120, 118, 131, 139, 146, 152, 168];
  const tgt = [90, 95, 100, 105, 110, 115, 120, 128, 136, 144, 152, 160];
  const now = new Date();
  return rev.map((r, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { month: d.toLocaleDateString('en-US', { month: 'short' }), revenue: r * 1000, target: tgt[i] * 1000 };
  });
}

const slug = (s: string) => s.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

export function buildSeed(): Dataset {
  const customers: Customer[] = (
    [
      ['Northwind Logistics', 'Hannah Brooks', 'Logistics', 'Enterprise', 'Austin, TX', 248000],
      ['Helix Biotech', 'Marcus Lee', 'Healthcare', 'Enterprise', 'Boston, MA', 196000],
      ['Brightwave Media', 'Elena Petrova', 'Media', 'Growth', 'New York, NY', 84000],
      ['Atlas Fintech', 'Omar Haddad', 'Finance', 'Enterprise', 'London, UK', 312000],
      ['Verdant Energy', 'Grace Okafor', 'Energy', 'Growth', 'Denver, CO', 121000],
      ['Orbit Retail', 'Lucas Meyer', 'Retail', 'Growth', 'Berlin, DE', 97000],
      ['Quanta Systems', 'Ananya Rao', 'Software', 'Enterprise', 'Bengaluru, IN', 175000],
      ['Lumen Health', 'Chloe Martin', 'Healthcare', 'Starter', 'Toronto, CA', 38000],
      ['Pinecrest Realty', 'Victor Alvarez', 'Real Estate', 'Starter', 'Miami, FL', 42000],
      ['Zephyr Airlines', 'Isabel Costa', 'Travel', 'Growth', 'Lisbon, PT', 133000],
    ] as [string, string, string, Tier, string, number][]
  ).map(([company, name, industry, tier, city, revenue], i) => ({
    id: `c${i + 1}`, company, name, industry, tier, city, revenue,
    email: `${slug(name)}@${slug(company)}.com`, phone: `+1 555 01${10 + i}`,
    owner: TEAM[i % 4].id, since: day(-(520 - i * 41)),
    notes: i % 3 === 0 ? 'Prefers email for contracts and calls for urgent matters.' : '',
  }));

  const leads: Lead[] = (
    [
      ['Maya Patel', 'Orbit Retail', 'Website', 'New', 24000],
      ['Tomas Novak', 'Cobalt Manufacturing', 'LinkedIn', 'Contacted', 56000],
      ['Rebecca Stone', 'Meridian Education', 'Referral', 'Qualified', 72000],
      ['Yusuf Demir', 'Sunrise Hotels', 'Event', 'New', 31000],
      ['Amelia Grant', 'Kestrel Aerospace', 'Partner', 'Qualified', 148000],
      ['Rohan Kapoor', 'Fluxwave Telecom', 'Cold Outreach', 'Contacted', 39000],
      ['Sara Lindholm', 'Nordic Timber', 'Website', 'Unqualified', 12000],
      ['Ethan Wu', 'Pixelforge Games', 'LinkedIn', 'Converted', 64000],
      ['Naomi Clarke', 'Harbor Insurance', 'Referral', 'Qualified', 94000],
      ['Diego Fernandez', 'SolarPeak', 'Event', 'Contacted', 48000],
      ['Leila Hassan', 'Cedar Pharma', 'Website', 'New', 27000],
      ['Jonas Weber', 'Alpine Robotics', 'Partner', 'Converted', 110000],
      ['Mia Johansson', 'BlueTide Shipping', 'Cold Outreach', 'Unqualified', 18000],
      ['Arjun Sethi', 'Zenith Analytics', 'LinkedIn', 'Qualified', 83000],
      ['Olivia Brown', 'Greenfield Foods', 'Referral', 'New', 36000],
      ['Kofi Mensah', 'Savanna Mobile', 'Event', 'Converted', 52000],
    ] as [string, string, LeadSource, LeadStatus, number][]
  ).map(([name, company, source, status, value], i) => ({
    id: `l${i + 1}`, name, company, source, status, value,
    email: `${slug(name)}@${slug(company)}.com`, phone: `+1 555 02${10 + i}`,
    owner: TEAM[(i + 1) % 5].id, createdAt: day(-(i * 3 + 1)), notes: '',
  }));

  const deals: Deal[] = (
    [
      ['Fleet analytics rollout', 'Northwind Logistics', 'Negotiation', 96000, 9, 'c1'],
      ['Clinical data platform', 'Helix Biotech', 'Proposal', 128000, 24, 'c2'],
      ['Campaign suite renewal', 'Brightwave Media', 'Won', 42000, -6, 'c3'],
      ['Risk engine licence', 'Atlas Fintech', 'Negotiation', 210000, 14, 'c4'],
      ['Grid monitoring pilot', 'Verdant Energy', 'Qualification', 58000, 40, 'c5'],
      ['Omnichannel POS', 'Orbit Retail', 'Prospecting', 34000, 55, 'c6'],
      ['Platform expansion', 'Quanta Systems', 'Won', 118000, -14, 'c7'],
      ['Patient portal', 'Lumen Health', 'Lost', 26000, -9, 'c8'],
      ['Listings CRM', 'Pinecrest Realty', 'Proposal', 31000, 19, 'c9'],
      ['Crew scheduling suite', 'Zephyr Airlines', 'Qualification', 87000, 33, 'c10'],
      ['Supply chain visibility', 'Cobalt Manufacturing', 'Prospecting', 56000, 62, undefined],
      ['Learning analytics', 'Meridian Education', 'Proposal', 72000, 27, undefined],
      ['Avionics data lake', 'Kestrel Aerospace', 'Qualification', 148000, 48, undefined],
      ['Game telemetry', 'Pixelforge Games', 'Won', 64000, -3, undefined],
      ['Claims automation', 'Harbor Insurance', 'Negotiation', 94000, 12, undefined],
      ['Merchant onboarding', 'Savanna Mobile', 'Lost', 33000, -20, undefined],
    ] as [string, string, DealStage, number, number, string | undefined][]
  ).map(([title, company, stage, value, close, customerId], i) => ({
    id: `d${i + 1}`, title, company, stage, value, customerId, closeDate: day(close),
    probability: stageProb[stage], owner: TEAM[i % 5].id,
  }));

  const tasks: Task[] = (
    [
      ['Send revised proposal', 'Include the updated onboarding timeline.', 1, 'Urgent', 0, 'in_progress', 'c1'],
      ['Prepare QBR deck', 'Pull usage and renewal data for the quarter.', 3, 'High', 2, 'todo', 'c4'],
      ['Follow up on contract redlines', '', 1, 'High', -1, 'todo', 'c2'],
      ['Book discovery call', 'Share two slots via calendar link.', 4, 'Medium', 3, 'todo', 'c5'],
      ['Update CRM notes after demo', '', 2, 'Low', 1, 'todo', 'c6'],
      ['Share security questionnaire', 'Needed by their InfoSec team.', 0, 'High', 4, 'in_progress', 'c7'],
      ['Renewal pricing review', 'Align on discount ceiling with finance.', 0, 'Urgent', 2, 'todo', 'c10'],
      ['Intro email to new champion', '', 4, 'Medium', -2, 'done', 'c3'],
      ['Onboarding kickoff agenda', '', 3, 'Medium', 5, 'todo', 'c8'],
      ['Collect testimonial', 'Ask after the next success call.', 3, 'Low', 9, 'todo', 'c9'],
      ['Reference call scheduling', '', 1, 'Medium', -4, 'done', 'c2'],
      ['Qualify inbound leads', 'Score this week’s website leads.', 4, 'High', 0, 'in_progress', undefined],
    ] as [string, string, number, Priority, number, TaskStatus, string | undefined][]
  ).map(([title, description, a, priority, due, status, customerId], i) => ({
    id: `t${i + 1}`, title, description, assignee: TEAM[a].id, priority, due: day(due), status, customerId,
  }));

  const activities: Activity[] = (
    [
      ['call', 'Discovery call with logistics ops team', 'c1', 0, '10:30', true, 'Walked through current fleet reporting gaps.'],
      ['meeting', 'Pricing workshop', 'c4', 0, '14:00', false, ''],
      ['email', 'Sent updated MSA draft', 'c2', -1, '16:20', true, 'Legal to confirm clauses 7 and 9.'],
      ['followup', 'Check in after security review', 'c7', 2, '11:00', false, ''],
      ['call', 'Renewal conversation', 'c10', -2, '09:15', true, 'Open to a two-year term with price lock.'],
      ['note', 'Champion moved to a new role; new sponsor is the CFO', 'c3', -3, '17:00', true, ''],
      ['meeting', 'Product demo for operations leadership', 'c5', 1, '15:30', false, ''],
      ['email', 'Shared case study and ROI calculator', 'c6', -4, '12:40', true, ''],
      ['call', 'Onboarding check-in', 'c8', -5, '13:00', true, 'Two seats unused; offered training.'],
      ['followup', 'Confirm pilot success criteria', 'c9', 3, '10:00', false, ''],
      ['meeting', 'Quarterly business review', 'c4', -7, '11:30', true, 'Expansion interest in the APAC region.'],
      ['email', 'Intro to solutions engineer', 'c1', -8, '09:50', true, ''],
      ['call', 'Executive sponsor alignment', 'c2', -9, '15:10', true, ''],
      ['note', 'Procurement requires vendor risk form', 'c7', -10, '08:45', true, ''],
      ['followup', 'Nudge on signed order form', 'c1', 4, '09:30', false, ''],
      ['email', 'Thank-you note after workshop', 'c10', -12, '18:05', true, ''],
    ] as [ActivityType, string, string, number, string, boolean, string][]
  ).map(([type, subject, customerId, off, time, done, notes], i) => ({
    id: `a${i + 1}`, type, subject, customerId, date: day(off), time, done, notes, owner: TEAM[i % 5].id,
  }));

  return { leads, deals, customers, tasks, activities };
}
