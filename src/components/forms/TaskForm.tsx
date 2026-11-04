import { useAppDispatch, useAppSelector, useToast } from '@/store/hooks';
import { tasksSlice } from '@/store/slices/entities';
import { useForm } from '@/hooks/useForm';
import { validateTask } from '@/lib/validators';
import { addDays, toISO, uid } from '@/lib/format';
import { PRIORITIES, TASK_STATUSES, type Task } from '@/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Fields';
import { ownerOptions, type FormProps } from './shared';

const statusLabel = { todo: 'To do', in_progress: 'In progress', done: 'Done' };

function Inner({ onClose, initial, customerId }: Omit<FormProps<Task>, 'open'> & { customerId?: string }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const customers = useAppSelector((s) => s.customers.items);
  const { values: v, errors: e, set, handle } = useForm({
    title: initial?.title ?? '', description: initial?.description ?? '', assignee: initial?.assignee ?? 'u1',
    priority: initial?.priority ?? 'Medium', due: initial?.due ?? toISO(addDays(new Date(), 2)),
    status: initial?.status ?? 'todo', customerId: initial?.customerId ?? customerId ?? '',
  }, validateTask);

  const submit = handle((x) => {
    const t: Task = {
      id: initial?.id ?? uid(), title: x.title.trim(), description: x.description.trim(), assignee: x.assignee,
      priority: x.priority as Task['priority'], due: x.due, status: x.status as Task['status'], customerId: x.customerId || undefined,
    };
    dispatch(initial ? tasksSlice.actions.updated(t) : tasksSlice.actions.added(t));
    toast(initial ? 'Task updated' : 'Task created');
    onClose();
  });

  return (
    <Modal title={initial ? 'Edit task' : 'New task'} onClose={onClose} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="task-form">{initial ? 'Save changes' : 'Create task'}</Button></>}>
      <form id="task-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="Title" className="sm:col-span-2" value={v.title} onChange={set('title')} error={e.title} autoFocus />
        <Textarea label="Description" className="sm:col-span-2" value={v.description} onChange={set('description')} />
        <Select label="Assigned to" value={v.assignee} onChange={set('assignee')} options={ownerOptions} />
        <Select label="Priority" value={v.priority} onChange={set('priority')} options={[...PRIORITIES]} />
        <Input label="Due date" type="date" value={v.due} onChange={set('due')} error={e.due} />
        <Select label="Status" value={v.status} onChange={set('status')} options={TASK_STATUSES.map((s) => ({ value: s, label: statusLabel[s] }))} />
        <Select label="Related customer" className="sm:col-span-2" value={v.customerId} onChange={set('customerId')} options={[{ value: '', label: 'None' }, ...customers.map((c) => ({ value: c.id, label: c.company }))]} />
      </form>
    </Modal>
  );
}
export default function TaskForm({ open, customerId, ...rest }: FormProps<Task> & { customerId?: string }) { return open ? <Inner key={rest.initial?.id ?? 'new'} customerId={customerId} {...rest} /> : null; }
