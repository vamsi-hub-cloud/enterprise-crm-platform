import { TEAM } from '@/data/seed';
export const ownerOptions = TEAM.map((m) => ({ value: m.id, label: m.name }));
export interface FormProps<T> { open: boolean; onClose: () => void; initial?: T }
