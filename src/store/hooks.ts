import { useCallback } from 'react';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './index';
import { pushToast } from './slices/uiSlice';
import { uid } from '@/lib/format';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') =>
      dispatch(pushToast({ id: uid(), type, message })),
    [dispatch],
  );
}
