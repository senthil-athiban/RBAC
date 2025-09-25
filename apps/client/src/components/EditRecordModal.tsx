import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Record } from '@/types';
import { toast } from 'sonner';
import { recordApi } from '@/lib/api';
import { RecordFormData, recordSchema } from '@/schema/record';
import { AxiosError } from 'axios';
// import { recordsCollection } from '@/api/records/queries';

interface EditRecordModalProps {
  record: Record;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRecordModal({ record, isOpen, onClose }: EditRecordModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
  });

  useEffect(() => {
    if (record) {
      reset({
        name: record.name,
        description: record.description || '',
      });
    }
  }, [record, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordFormData }) =>
      recordApi.editRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      toast.success('Record updated successfully')
      onClose();
    },
    onError: (error) => {
      console.log('Failed to update record', error);
      toast.error(error instanceof AxiosError ? error?.response?.data?.message : 'Failed to update record');
    },
  });

  const onSubmit = async (data: RecordFormData) => {
    // updateMutation.mutate({
    //   id: record._id,
    //   data: {
    //     name: data.name,
    //     description: data.description || undefined,
    //   },
    // }, {
    //   onSuccess: () => {
    //     toast.success('Record updated successfully')
    //     onClose();
    //   }
    // });

    // const local = recordsCollection.get(record._id);
    // console.log('local:', local);
// if (!local) {
//   console.warn(`Record ${record._id} not in local DB yet`);
//   return;
// }

    // recordsCollection.update(record._id, (draft) => {
    //   draft.name = data.name;
    //   draft.description = data.description
    // });

    await updateMutation.mutateAsync({
      data: data,
      id: record._id
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Edit Record</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update the record information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {updateMutation.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {updateMutation.error instanceof Error 
                  ? updateMutation.error.message 
                  : 'Failed to update record'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-gray-700 font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter record name"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-gray-700 font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Enter record description (optional)"
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="text-xs text-gray-500">Maximum 500 characters</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}