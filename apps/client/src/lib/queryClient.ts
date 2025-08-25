import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';
import {
  PersistedClient,
  Persister,
  // persistQueryClient,
} from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// export const createIndexedDBPersister = () => {
//   let db = null;
//   const dbName = 'react-query-cache';
//   const storeName = 'queries';

//   const openDB = () => {
//     return new Promise((resolve, reject) => {
//       if (db) {
//         resolve(db);
//         return;
//       }

//       const request = indexedDB.open(dbName, 1);
      
//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         db = request.result;
//         resolve(db);
//       };
      
//       request.onupgradeneeded = () => {
//         const database = request.result;
//         if (!database.objectStoreNames.contains(storeName)) {
//           database.createObjectStore(storeName);
//         }
//       };
//     });
//   };

//   return {
//     persistClient: async (client) => {
//       try {
//         const database = await openDB();
//         console.log('database:', database)
//         const transaction = database.transaction([storeName], 'readwrite');
//         const store = transaction.objectStore(storeName);
        
//         const serializedClient = JSON.stringify({
//           clientState: client,
//           timestamp: Date.now()
//         });
        
//         await new Promise((resolve, reject) => {
//           const request = store.put(serializedClient, 'client');
//           request.onsuccess = () => resolve();
//           request.onerror = () => reject(request.error);
//         });
//       } catch (error) {
//         console.error('Failed to persist client:', error);
//       }
//     },
    
//     restoreClient: async () => {
//       try {
//         const database = await openDB();
//         const transaction = database.transaction([storeName], 'readonly');
//         const store = transaction.objectStore(storeName);
        
//         return new Promise((resolve) => {
//           const request = store.get('client');
//           request.onsuccess = () => {
//             if (request.result) {
//               try {
//                 const parsed = JSON.parse(request.result);
//                 // Optional: Add expiration logic
//                 const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000; // 24 hours
//                 if (isExpired) {
//                   resolve(undefined);
//                   return;
//                 }
//                 resolve(parsed.clientState);
//               } catch {
//                 resolve(undefined);
//               }
//             } else {
//               resolve(undefined);
//             }
//           };
//           request.onerror = () => resolve(undefined);
//         });
//       } catch (error) {
//         console.error('Failed to restore client:', error);
//         return undefined;
//       }
//     },
    
//     removeClient: async () => {
//       try {
//         const database = await openDB();
//         const transaction = database.transaction([storeName], 'readwrite');
//         const store = transaction.objectStore(storeName);
        
//         await new Promise((resolve, reject) => {
//           const request = store.delete('client');
//           request.onsuccess = () => resolve();
//           request.onerror = () => reject(request.error);
//         });
//       } catch (error) {
//         console.error('Failed to remove client:', error);
//       }
//     }
//   } as Persister
// };

// export const createPersistedQueryClient = () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         staleTime: 1000 * 60 * 5, // 5 minutes
//         gcTime: 1000 * 60 * 60 * 24, // 24 hours
//         retry: 1,
//       },
//     },
//   });

//   const persister = createIndexedDBPersister();

//   // Initialize persistence
//   persistQueryClient({
//     queryClient,
//     persister,
//     maxAge: 1000 * 60 * 60 * 24, // 24 hours
//     buster: '1.0.0', // Change this to invalidate old cache
    
//   });

//   return queryClient;
// };

/**
 * Creates an Indexed DB persister with proper serialization handling
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      // Strip non-serializable values (functions, etc.)
      const safeClient: PersistedClient = {
        ...client,
        clientState: {
          ...client.clientState,
          queries: client.clientState.queries.map(q => ({
            ...q,
            state: {
              ...q.state,
              data: JSON.parse(JSON.stringify(q.state.data)), // deep clone serializable only
            },
          })),
        },
      }
      await set(idbValidKey, safeClient)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey)
    },
    removeClient: async () => {
      await del(idbValidKey)
    },
  } as Persister
}