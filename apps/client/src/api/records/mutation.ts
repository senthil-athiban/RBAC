import { recordApi } from "@/lib/api";
import { RecordFormData } from "@/schema/record";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
    mutationFn: recordApi.deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
    onError: (error) => {
      console.log('error:', error);
      toast.error('Failed to delete record')
    },
  });
}

export const useAddRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordApi.createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create record');
    },
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