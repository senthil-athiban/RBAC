/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense } from 'react';
import { MutationCache, onlineManager, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import AuthProvider from './context/auth.context';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
// import { DashboardPage } from './pages/DashboardPage';
const NewRecordPage = lazy(() => import('./pages/NewRecordPage'));
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Permissions, PermissionTypes } from 'core';
// import { createIDBPersister } from './lib/queryClient';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { DashboardPage } from './pages/DashboardPage';
import { recordApi } from './lib/api';
import { RecordFormData } from './schema/record';

const AuthLayout = () => (
  <div className='w-full'>
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  </div>
);

const PublicLayout = () => (
  <PublicRoute>
    <Outlet />
  </PublicRoute>
);

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
    mutations: {
      // Mutations will be paused when offline and resumed when back online
      networkMode: 'offlineFirst',
      // Retry mutations that failed due to network issues
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 4xx error (client error)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
  mutationCache: new MutationCache({
    onError: (error: any) => {
      console.error('Mutation error:', error);
      // You can add custom error handling here
    },
  }),
});

const persister = createSyncStoragePersister({
  storage: window.localStorage
})

onlineManager.setOnline(navigator.onLine)

// Optionally listen to events
window.addEventListener('online', () => onlineManager.setOnline(true))
window.addEventListener('offline', () => onlineManager.setOnline(false))

// const persister = createIDBPersister();

// const dataLoader = (queryClient: QueryClient) =>
//   async () => {
//     const query = recordsQuery;
//     return (
//       queryClient.getQueryData(query.queryKey) ??
//       (await queryClient.fetchQuery(query))
//     )
//   }

queryClient.setMutationDefaults(['records'], {
  mutationFn: async (newRecord: any) => {
    await queryClient.invalidateQueries({ queryKey: ['records'] });
    return recordApi.createRecord(newRecord);
  }
});

queryClient.setMutationDefaults(['edit-record'], {
  mutationFn: ({ id, data }: { id: string; data: RecordFormData }) =>
    recordApi.editRecord(id, data),
  onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
});

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: '/',
          element: <PublicLayout />,
          children: [
            {
              index: true, // 👈 when path = "/", redirect to /login
              element: <Navigate to="/login" replace />,
            },
            {
              path: "/login",
              element: <LoginPage />,
            },
            {
              path: "/register",
              element: <RegisterPage />,
            },
          ]
        },
        {
          path: "/dashboard",
          // loader: async () => {
          //   const query = recordsQuery;
          //   // const result = queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));
          //   const result = queryClient.ensureQueryData(query);
          //   console.log('result:', result);
          //   return result;
          // },
          element: (
            <ProtectedRoute permissionType={PermissionTypes.RECORDS} permissions={Permissions.READ}>
              {/* <p>Dash</p> */}
              <DashboardPage />
            </ProtectedRoute>
          )
        },
        {
          path: "/records/new",
          // loader: async () => {
          //   const query = recordsQuery;
          //   const result = queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));
          //   console.log('result:', result);
          //   return result;
          // },
          element: (
            <Suspense fallback={<p>Loading...</p>}>
              <ProtectedRoute permissionType={PermissionTypes.RECORDS} permissions={Permissions.CREATE}>
                <NewRecordPage />
              </ProtectedRoute>
            </Suspense>
          )
        },
        { path: '*', element: <Navigate to="/login" replace /> }
      ]
    }
  ]);

  console.log('mode:', onlineManager.isOnline());
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister,
      }}
      onSuccess={ async () => {
        console.log('REsuming....');
        // resume mutations after initial restore from localStorage was successful
        // await queryClient.resumePausedMutations().then( async () => {
        //   await queryClient.invalidateQueries()
        // })
        // const mutations = queryClient.getMutationCache().getAll();
        // await Promise.all(mutations.map( async (mutate) => {
        //   await mutate.execute(mutate.state);
        // }));
      }}
      
    >
      <Toaster />
      <ReactQueryDevtools />
      <RouterProvider router={router} />
    </PersistQueryClientProvider>

  );
}

export default App;