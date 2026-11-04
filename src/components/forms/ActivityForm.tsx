import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { activitiesSlice } from '@/store/slices/entities';
import { useForm } from '@/hooks/useForm';
import { validateActivity } from '@/lib/validators';
import { todayISO, uid } from '@/lib/format';
import { activityMeta } from '@/lib/meta';
import { ACTIVITY_TYPES, type Activity } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Fields';
import { ownerOptions, type FormProps } from './shared';

function Inner({ onClose, initial, customerId }: Omit<FormProps<Activity>, 'open'> & { customerId?: string }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const customers = useAppSelector((s) => s.customers.items);
  const { values: v, errors: e, set, handle } = useForm({
    type: initial?.type ?? 'call', subject: initial?.subject ?? '', customerId: initial?.customerId ?? customerId ?? '',
    date: initial?.date ?? todayISO(), time: initial?.time ?? '10:00', owner: initial?.owner ?? 'u1',
    notes: initial?.notes ?? '', done: initial ? (initial.done ? 'yes' : 'no') : 'yes',
  }, validateActivity);

  const submit = handle((x) => {
    const a: Activity = {
      id: initial?.id ?? uid(), type: x.type as Activity['type'], subject: x.subject.trim(), customerId: x.customerId || undefined,
      date: x.date, time: x.time, owner: x.owner, notes: x.notes.trim(), done: x.done === 'yes',
    };
    dispatch(initial ? activitiesSlice.actions.updated(a) : activitiesSlice.actions.added(a));
    toast(initial ? 'Activity updated' : 'Activity logged');
    onClose();
  });

  return (
    <Modal title={initial ? 'Edit activity' : 'Log activity'} subtitle="Record a call, meeting, email, note or a follow-up to do." onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="activity-form">{initial ? 'Save changes' : 'Log activity'}</Button></>}>
      <form id="activity-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Select label="Type" value={v.type} onChange={set('type')} options={ACTIVITY_TYPES.map((t) => ({ value: t, label: activityMeta[t].label }))} />
        <Select label="Status" value={v.done} onChange={set('done')} options={[{ value: 'yes', label: 'Completed' }, { value: 'no', label: 'Planned' }]} />
        <Input label="Subject" className="sm:col-span-2" value={v.subject} onChange={set('subject')} error={e.subject} autoFocus />
        <Select label="Customer" value={v.customerId} onChange={set('customerId')} options={[{ value: '', label: 'Not linked' }, ...customers.map((c) => ({ value: c.id, label: c.company }))]} />
        <Select label="Owner" value={v.owner} onChange={set('owner')} options={ownerOptions} />
        <Input label="Date" type="date" value={v.date} onChange={set('date')} error={e.date} />
        <Input label="Time" type="time" value={v.time} onChange={set('time')} error={e.time} />
        <Textarea label="Notes" className="sm:col-span-2" value={v.notes} onChange={set('notes')} />
      </form>
    </Modal>
  );
}
export default function ActivityForm({ open, customerId, ...rest }: FormProps<Activity> & { customerId?: string }) { return open ? <Inner key={rest.initial?.id ?? 'new'} customerId={customerId} {...rest} /> : null; }
