import { configureStore } from '@reduxjs/toolkit';
import { activitiesSlice, customersSlice, dealsSlice, leadsSlice, tasksSlice } from './slices/entities';
import ui from './slices/uiSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      leads: leadsSlice.reducer,
      deals: dealsSlice.reducer,
      customers: customersSlice.reducer,
      tasks: tasksSlice.reducer,
      activities: activitiesSlice.reducer,
      ui,
    },
  });

export const store = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
