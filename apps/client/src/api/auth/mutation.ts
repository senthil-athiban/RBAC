import { useMutation } from "@tanstack/react-query"
import type { LoginPayload, RegisterPayload } from "../../types/auth";
import { authApi } from "@/lib/api";

export const useLoginUser = () => {
    return useMutation({
        mutationFn: (payload: LoginPayload) => authApi.login(payload)
    })
};

export const useRegisterUser = () => {
    return useMutation({
        mutationFn: (payload: RegisterPayload) => authApi.register(payload)
    })
};