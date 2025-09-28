/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryClient } from "@/App";
import { recordApi } from "@/lib/api";
import { RecordFormData } from "@/schema/record";
import { DefaultError, onlineManager, QueryClient, useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recordsQuery } from "./queries";

const tempIdMap = new Map<string, string>();

export const useDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordApi.deleteRecord,
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['records'] });
      const data = await queryClient.getQueryData(['records']);
      console.log('new data:', data);
    },
    onError: (error) => {
      console.log('error:', error);
      toast.error('Failed to delete record')
    },
  });
}

export function useOfflineMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>
  (options: UseMutationOptions<TData, TError, TVariables, TContext>, queryClient?: QueryClient): UseMutationResult<TData, TError, TVariables, TContext> {

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn: async (variables: TVariables) => {
      // If offline, we short-circuit and let react-query handle queuing
      if (!onlineManager.isOnline()) {
        throw new Error("Offline: mutation queued");
      }
      if (!options.mutationFn) {
        throw new Error("mutationFn is required");
      }

      return options.mutationFn(variables);
    },
    networkMode: 'offlineFirst', // ✅ ensures queuing
  }, queryClient);
}

export function useAddRecord() {

  return useOfflineMutation({
    mutationKey: ['records'],
    mutationFn: async (newRecord: { name: string, description: string, _id?: string }) => {
      // If it's already a temp record, map it later
      const created = await recordApi.createRecord(newRecord);
      console.log('created:', created);
      const data = created.data;

      if (newRecord._id?.startsWith('temp-')) {
        tempIdMap.set(newRecord._id, data?.record?._id);
      }

      return created;
    },
    onMutate: async (newRecord) => {
      await queryClient.cancelQueries({ queryKey: ['records'] });

      const previousRecords = queryClient.getQueryData(['records']) || [];

      const optimisticRecord = {
        ...newRecord,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true, // flag to show "not yet synced"
      };

      queryClient.setQueryData(['records'], (old: unknown[] = []) => [
        optimisticRecord,
        ...old,
      ]);

      console.log('previousRecords:', previousRecords);

      return { previousRecords };
    },
    onError: (_err, _, ctx) => {
      if (ctx?.previousRecords) {
        queryClient.setQueryData(['records'], ctx.previousRecords);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
    onSuccess: ({ data }) => {
      toast.success('success...');
      if (data.record._id?.startsWith('temp-')) {
        const realId = data.record?._id;
        tempIdMap.set(data.record._id, realId);
      }
    }
  });
}

export const useUpdateRecord = () =>
  useOfflineMutation({
    mutationKey: ['edit-record'],
    mutationFn: async ({ id, data }: { id: string; data: RecordFormData }) => {

      console.log('tempIdMap:', tempIdMap);
      console.log('id:', id);

      const realId = tempIdMap.get(id) || id;
      return await recordApi.editRecord(realId, data);
    },
    onMutate: async ({ id, data }: { id: string; data: RecordFormData }) => {

      await queryClient.cancelQueries({ queryKey: ['records'] });

      const previousRecords = queryClient.getQueryData(recordsQuery.queryKey);

      console.log('previousRecords:', previousRecords);

      // console.log('previousRecords:', previousRecords);
      const newRecords = previousRecords?.map(r => (r._id === id ? { ...r, ...data, pending: r._id.startsWith('temp-') } : r))
      // console.log('newRecords:', newRecords);
      queryClient.setQueryData(['records'], newRecords);

      return { previousRecords };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast.success('Record updated successfully')
    },
    onError: (error) => {
      console.log('Failed to update record', error);
    },
  });

// export const useUpdateRecord = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: RecordFormData }) =>
//       recordApi.editRecord(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['records'] });
//     },
//     onError: (error) => {
//       console.log('Failed to update record', error);
//       toast.error('Failed to update record')
//     },
//   });
// }