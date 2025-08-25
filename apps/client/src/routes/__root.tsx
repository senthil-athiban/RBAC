// src/routes/__root.tsx
import { Outlet } from '@tanstack/react-router';
import AuthProvider from '../context/auth.context';

export const Route = () => {
  return (
    <div className="w-full">
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  );
};


// import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
// import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Toaster } from 'sonner';
// import { QueryClient } from '@tanstack/react-query';
// import { createIDBPersister } from '@/lib/queryClient';

// const queryClient = new QueryClient();

// const persister = createIDBPersister();

// export const Route = createRootRoute({
//   component: () => (
//     <>
//       <PersistQueryClientProvider
//     client={queryClient}
//     persistOptions={{
//       persister
//     }}
//   >
//     <Outlet />
//       <Toaster />
//       <ReactQueryDevtools initialIsOpen={false} />
//       <TanStackRouterDevtools />
//     </PersistQueryClientProvider>
//     </>
//   ),
// })