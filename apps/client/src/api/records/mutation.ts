import { recordApi } from "@/lib/api";
import { RecordFormData } from "@/schema/record";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

// export const useAddRecord = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: recordApi.createRecord,
//     onSuccess: async () => {
//       await queryClient.refetchQueries({ queryKey: ['records'] });
//     },
//     onError: (error) => {
//       toast.error(error instanceof Error ? error.message : 'Failed to create record');
//     },
//   });
// }

export function useAddRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordApi.createRecord,
    networkMode: 'offlineFirst', // ✅ queue if offline
    onMutate: async (newRecord) => {
      await queryClient.cancelQueries({ queryKey: ['records'] });

      const previousRecords = queryClient.getQueryData(['records']) || [];
      console.log('previousRecords:', previousRecords);

      const optimisticRecord = {
        _id: `temp-${Date.now()}`,
        ...newRecord,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true, // flag to show "not yet synced"
      };

      console.log('optimisticRecord:', optimisticRecord);

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
    onSuccess: () => {
      toast.success('success...')
    }
  });
}

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
      mutationFn: ({ id, data }: { id: string; data: RecordFormData }) =>
        recordApi.editRecord(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['records'] });
      },
      onError: (error) => {
        console.log('Failed to update record', error);
        toast.error('Failed to update record')
      },
    });
}