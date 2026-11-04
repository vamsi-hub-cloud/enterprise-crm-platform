import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Base { label: string; error?: string; hint?: string; className?: string }

function Wrap({ label, error, hint, className, children, id }: Base & { children: ReactNode; id: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-800">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-medium text-coral-600">{error}</p>
        : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
const ring = (e?: string) => (e ? 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20' : '');

export function Input({ label, error, hint, className, id, ...p }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const key = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return <Wrap id={key} {...{ label, error, hint, className }}><input id={key} aria-invalid={!!error} aria-describedby={error ? `${key}-err` : undefined} className={cn('input', ring(error))} {...p} /></Wrap>;
}
export function Textarea({ label, error, hint, className, id, ...p }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const key = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return <Wrap id={key} {...{ label, error, hint, className }}><textarea id={key} rows={3} className={cn('input resize-none', ring(error))} {...p} /></Wrap>;
}
export function Select({ label, error, hint, className, id, options, ...p }: Base & SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[] }) {
  const key = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <Wrap id={key} {...{ label, error, hint, className }}>
      <select id={key} className={cn('input', ring(error))} {...p}>
        {options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrap>
  );
}
