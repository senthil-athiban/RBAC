import { LoginPayload, LoginResponse, RegisterPayload, UserResponse } from "@/types/auth";
import axiosInstance from "./axios";
import { GetRecordResponse } from "@/types";

interface CreateRecordResponse {
     record: {
        name: string;
        description: string;
        user: string;
        _id: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    }
}
const recordApi = {
    getRecords: () => axiosInstance.get<GetRecordResponse>('/record'),
    editRecord: (recordId: string, payload: { name: string; description?: string }) => axiosInstance.post(`/record/${recordId}`, payload),
    deleteRecord: (recordId: string) => axiosInstance.delete(`/record/${recordId}`),
    createRecord: (payload:{name: string, description?: string}) => axiosInstance.post<CreateRecordResponse>(`/record`, payload)
}

const authApi = {
    login: (payload: LoginPayload) => axiosInstance.post<LoginResponse>('/auth/login', payload),
    register: (payload: RegisterPayload) => axiosInstance.post('/auth/register', payload)
}

const userApi = {
    getCurrentUser: () => axiosInstance.get<UserResponse>('/user/me')
}

export { recordApi, authApi, userApi }