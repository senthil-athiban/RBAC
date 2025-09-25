import { recordApi } from "@/lib/api";
import { onlineManager, queryOptions, useQuery } from "@tanstack/react-query";
// import { createCollection } from '@tanstack/react-db'
// import { queryCollectionOptions } from '@tanstack/query-db-collection'
// import { queryClient } from "@/lib/queryClient";

// export const recordsCollection = createCollection(
//     queryCollectionOptions({
//         queryKey: ['records-db'],
//         queryFn: async () => {
//             const response = await recordApi.getRecords();
//             return response.data.records;
//         },
//         queryClient: queryClient,
//         getKey: (item) => item._id,
//         onInsert: async ({ transaction }) => {
//             const { modified: newTodo } = transaction.mutations[0]
//             await recordApi.createRecord(newTodo);
//         },
//         onUpdate: async ({ transaction }) => {
//             const { original, modified } = transaction.mutations[0];
//             console.log('original:', original);
//             console.log('modified:', modified);
//             await recordApi.editRecord(original._id, modified);
//         },
//         onDelete: async ({ transaction }) => {
//             const { original } = transaction.mutations[0];
//             await recordApi.deleteRecord(original._id)
//         },
//     })
// )

export const recordsQuery = queryOptions({
        queryKey: ['records'],
        queryFn: async () => {
            const response = await recordApi.getRecords();
            return response.data.records;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    });

export const useGetRecords = () => {
    const isOnline = onlineManager.isOnline();
    console.log('isOnline:', isOnline)
    return useQuery({
        ...recordsQuery,
        enabled: isOnline,
        networkMode: 'offlineFirst'
    });
}