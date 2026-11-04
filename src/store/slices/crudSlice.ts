import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Dataset } from '@/types';
import { loadData } from '../thunks';

export interface CrudState<T> { items: T[] }

export function createCrudSlice<T extends { id: string }>(name: keyof Dataset) {
  return createSlice({
    name,
    initialState: { items: [] as T[] } as CrudState<T>,
    reducers: {
      added: (s, a: PayloadAction<T>) => {
        (s.items as unknown as T[]).unshift(a.payload);
      },
      updated: (s, a: PayloadAction<T>) => {
        const list = s.items as unknown as T[];
        const i = list.findIndex((x) => x.id === a.payload.id);
        if (i >= 0) list[i] = a.payload;
      },
      removed: (s, a: PayloadAction<string>) => {
        s.items = (s.items as unknown as T[]).filter((x) => x.id !== a.payload) as never;
      },
    },
    extraReducers: (b) => {
      b.addCase(loadData.fulfilled, (_s, a) => ({ items: a.payload[name] as unknown as T[] }));
    },
  });
}
