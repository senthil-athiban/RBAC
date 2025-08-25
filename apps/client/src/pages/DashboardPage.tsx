import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditRecordModal } from '@/components/EditRecordModal';
import { DeleteRecordModal } from '@/components/DeleteRecordModal';

import { format } from 'date-fns';
import { toast } from 'sonner';
import { useDeleteMutation } from '@/api/records/mutation';
import { Record } from '@/types';
import { useGetRecords } from '@/api/records/queries';
import { AxiosError } from 'axios';
import UserHasAccess from '@/components/auth/UserHasAccess';
import { Permissions, PermissionTypes } from 'core';
import { useAuth } from '@/context/auth.context';
import loadableVisibility from "react-loadable-visibility/loadable-components";

const VisibilityEmojiPicker = loadableVisibility(() => import("./emoji"), {
  fallback: <p>loading...</p>
});

export function DashboardPage() {
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { logout } = useAuth();

  const { data: records = [], isLoading, isError } = useGetRecords();

  const deleteMutation = useDeleteMutation();
  // const { data: records, isLoading, isError } = useLiveQuery((q) =>
  //   q.from({ todo: recordsCollection })
  // );

  // console.log('records:', records);

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
  };

  const handleDelete = (recordId: string) => {
    setDeletingRecordId(recordId);
  };

  const confirmDelete = () => {
    if (deletingRecordId) {
      deleteMutation.mutate(deletingRecordId, {
        onSuccess: () => {
          toast.success('Record deleted successfully')
          setDeletingRecordId(null);
        },
        onError: (err) => {
          console.log('Failed to delete record:', err);
          toast.error(err instanceof AxiosError ? err?.response?.data?.message : 'Failed to delete record');
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load records. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onMouseEnter={() => VisibilityEmojiPicker.preload()}>
        Toggle Visibility EmojiPicker
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your records efficiently</p>
        </div>
        <div className='flex gap-x-2 items-center'>
          <UserHasAccess permissionType={PermissionTypes.RECORDS} permissions={Permissions.CREATE}>
            <Button
              onClick={() => navigate('/records/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </UserHasAccess>
          <Button
            onClick={() => logout()}
            variant={'destructive'}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-blue-100">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{records.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-green-100">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {records.filter(record => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(record.createdAt) > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-purple-100">Updated Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {records.filter(record => {
                const today = new Date();
                const recordDate = new Date(record.updatedAt);
                return recordDate.toDateString() === today.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Records
          </CardTitle>
          <CardDescription>
            Manage and organize your records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first record.</p>
              <Button
                onClick={() => navigate('/records/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700">Updated</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{record?.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-md">
                        {record?.description ? (
                          <span className="truncate block">{record?.description}</span>
                        ) : (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(record?.createdAt), 'MMM dd, yyyy')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(record?.updatedAt), 'MMM dd, yyyy')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <UserHasAccess permissionType={PermissionTypes.RECORDS} permissions={Permissions.UPDATE}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </UserHasAccess>
                          <UserHasAccess permissionType={PermissionTypes.RECORDS} permissions={Permissions.DELETE}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </UserHasAccess>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      
      <div style={{ height: "600px", background: "#f0f0f0", margin: "20px 0" }}>
        Scroll down to see EmojiPicker mount...
      </div>

      <VisibilityEmojiPicker />
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {deletingRecordId && (
        <DeleteRecordModal
          isOpen={!!deletingRecordId}
          onClose={() => setDeletingRecordId(null)}
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}