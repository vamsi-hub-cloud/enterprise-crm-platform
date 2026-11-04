import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import { STORAGE_KEY } from './store/thunks';
import './index.css';

// Persist data locally so edits survive a refresh (stand-in for a real API).
store.subscribe(() => {
  const s = store.getState();
  if (s.ui.status !== 'ready') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      leads: s.leads.items, deals: s.deals.items, customers: s.customers.items, tasks: s.tasks.items, activities: s.activities.items,
    }));
  } catch { /* storage full or unavailable: keep working in memory */ }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
