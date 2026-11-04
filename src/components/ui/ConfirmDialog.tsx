import Modal from './Modal';
import Button from './Button';

interface Props { title: string; message: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onClose }: Props) {
  return (
    <Modal title={title} onClose={onClose} footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
    </>}>
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
