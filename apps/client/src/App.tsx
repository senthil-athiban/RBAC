/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense } from 'react';
import { MutationCache, QueryClient } from '@tanstack/react-query';
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

import { DashboardPage } from './pages/DashboardPage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Queries will work offline using cached data
      networkMode: 'offlineFirst',
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
  storage: window.localStorage,
})

// const persister = createIDBPersister();

// const dataLoader = (queryClient: QueryClient) =>
//   async () => {
//     const query = recordsQuery;
//     return (
//       queryClient.getQueryData(query.queryKey) ??
//       (await queryClient.fetchQuery(query))
//     )
//   }

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

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        // resume mutations after initial restore from localStorage was successful
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries()
        })
      }}
    >
      <Toaster />
      <ReactQueryDevtools />
      <RouterProvider router={router} />
    </PersistQueryClientProvider>

  );
}

export default App;