import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Pipeline from '@/pages/Pipeline';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import Tasks from '@/pages/Tasks';
import Activities from '@/pages/Activities';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Team from '@/pages/Team';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="activities" element={<Activities />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="team" element={<Team />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
