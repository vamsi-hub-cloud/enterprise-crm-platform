import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ToastMsg } from '@/types';
import { loadData } from '../thunks';

interface UiState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  toasts: ToastMsg[];
  sidebarOpen: boolean;
}
const initialState: UiState = { status: 'idle', error: null, toasts: [], sidebarOpen: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast: (s, a: PayloadAction<ToastMsg>) => { s.toasts.push(a.payload); },
    dismissToast: (s, a: PayloadAction<string>) => { s.toasts = s.toasts.filter((t) => t.id !== a.payload); },
    setSidebar: (s, a: PayloadAction<boolean>) => { s.sidebarOpen = a.payload; },
  },
  extraReducers: (b) => {
    b.addCase(loadData.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(loadData.fulfilled, (s) => { s.status = 'ready'; })
      .addCase(loadData.rejected, (s, a) => { s.status = 'error'; s.error = a.payload ?? 'Something went wrong.'; });
  },
});
export const { pushToast, dismissToast, setSidebar } = uiSlice.actions;
export default uiSlice.reducer;
