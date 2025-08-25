/* eslint-disable @typescript-eslint/no-explicit-any */
// // src/App.tsx
// import { RouterProvider } from '@tanstack/react-router';
// import { router } from './router';
// import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// import { QueryClient } from '@tanstack/react-query';
// import { createIDBPersister } from './lib/queryClient';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Toaster } from 'sonner';

// const queryClient = new QueryClient();
// const persister = createIDBPersister();

// function App() {
//   return (
//     <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
//       <Toaster />
//       <ReactQueryDevtools />
//       <RouterProvider router={router} />
//     </PersistQueryClientProvider>
//   );
// }

// export default App;


import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import AuthProvider from './context/auth.context';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewRecordPage } from './pages/NewRecordPage';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Permissions, PermissionTypes } from 'core';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createIDBPersister } from './lib/queryClient';

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

const persister = createIDBPersister();

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: '',
          element: <PublicLayout />,
          children: [
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
          element: (
            <ProtectedRoute permissionType={PermissionTypes.RECORDS} permissions={Permissions.READ}>
              <DashboardPage />
            </ProtectedRoute>
          )
        },
        {
          path: "/records/new",
          element: (
            <ProtectedRoute permissionType={PermissionTypes.RECORDS} permissions={Permissions.CREATE}>
              <NewRecordPage />
            </ProtectedRoute>
          )
        },
        { path: '*', element: <Navigate to="/dashboard" replace /> }
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