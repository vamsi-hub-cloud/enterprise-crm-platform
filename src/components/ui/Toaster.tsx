import { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissToast } from '@/store/slices/uiSlice';
import type { ToastMsg } from '@/types';

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const color = { success: 'text-brand-400', error: 'text-coral-500', info: 'text-sky-400' };

function Toast({ t }: { t: ToastMsg }) {
  const dispatch = useAppDispatch();
  useEffect(() => { const id = setTimeout(() => dispatch(dismissToast(t.id)), 3600); return () => clearTimeout(id); }, [dispatch, t.id]);
  const Icon = icons[t.type];
  return (
    <div role="status" className="flex animate-slide items-center gap-3 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-pop">
      <Icon className={`h-5 w-5 shrink-0 ${color[t.type]}`} />{t.message}
    </div>
  );
}
export default function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  return <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 [&>*]:pointer-events-auto">{toasts.map((t) => <Toast key={t.id} t={t} />)}</div>;
}
