import { userApi } from "@/lib/api"
import { useOfflineQuery } from "../records/queries"

export const useGetUser = (enabled: boolean) => {
    return useOfflineQuery({
        queryKey: ['user'],
        queryFn: () => userApi.getCurrentUser(),
        select: (res) => res.data,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: enabled,
    })
}