import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Dataset } from '@/types';
import { buildSeed } from '@/data/seed';

export const STORAGE_KEY = 'northstar-crm-v1';

/** Simulates an API round-trip. Swap the body for real fetch() calls when a backend exists. */
export const loadData = createAsyncThunk<Dataset, void, { rejectValue: string }>('data/load', async (_, { rejectWithValue }) => {
  try {
    await new Promise((r) => setTimeout(r, 750));
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as Dataset) : buildSeed();
  } catch {
    return rejectWithValue('We could not load your CRM data. Check your connection and try again.');
  }
});
