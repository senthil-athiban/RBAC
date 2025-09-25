import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useGetUser = (enabled: boolean) => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => userApi.getCurrentUser(),
        select: (res) => res.data,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: enabled,
        networkMode: 'offlineFirst'
    })
}