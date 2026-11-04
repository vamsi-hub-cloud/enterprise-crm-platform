import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadData } from '@/store/thunks';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Toaster from '../ui/Toaster';

export default function Layout() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.ui);
  const { pathname } = useLocation();

  useEffect(() => { dispatch(loadData()); }, [dispatch]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {status === 'error' ? (
            <div className="card mx-auto mt-16 max-w-md p-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-50 text-coral-600"><AlertTriangle className="h-7 w-7" /></span>
              <h2 className="text-lg font-bold">Data didn’t load</h2>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <Button className="mt-5" onClick={() => dispatch(loadData())} icon={<RefreshCw className="h-4 w-4" />}>Try again</Button>
            </div>
          ) : status !== 'ready' ? (
            <div className="space-y-6" aria-busy="true" aria-label="Loading">
              <Skeleton className="h-9 w-64" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
              <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-72 lg:col-span-2" /><Skeleton className="h-72" /></div>
            </div>
          ) : <Outlet />}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
