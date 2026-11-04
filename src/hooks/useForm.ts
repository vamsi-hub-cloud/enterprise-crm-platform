import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Errs, Vals } from '@/lib/validators';

type Field = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export function useForm<V extends Vals>(initial: V, validate: (v: V) => Errs) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Errs>({});

  const set = (key: keyof V & string) => (e: Field) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };
  const handle = (onValid: (v: V) => void) => (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.values(found).every((x) => !x)) onValid(values);
  };
  return { values, errors, set, handle };
}
