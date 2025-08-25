import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useLoginUser, useRegisterUser } from "../api/auth/mutation";
import type { IUser, LoginPayload, RegisterPayload } from "../types/auth";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useGetUser } from "@/api/user/queries";
import { AxiosError } from "axios";

export type TAuthContext = {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean | null;
    error: Error | null;
    login: (data: LoginPayload) => void;
    logout: (redirect?: string) => void;
    register: (data: RegisterPayload) => void;
    isLoading: boolean;
};

const AuthContext = createContext<TAuthContext | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean|null>(null);
    const [error, setError] = useState<Error | null>(null);

    const navigate = useNavigate();

    const loginUserMutation = useLoginUser();
    const registerMutation = useRegisterUser();
    const { data: userDetails, isLoading, isError, error: userError } = useGetUser(true);
    console.log('userDetails:', userDetails)

    useEffect(() => {
        if (isError && userError) {
            if (userError instanceof AxiosError) {
                if (userError.response?.data.message === 'Un Authorized') {
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
        } else if (!isLoading && userDetails) {
            setUser(userDetails?.user);
            setIsAuthenticated(true);
        }
    }, [isError, isLoading, userDetails, userError])

    const login = useCallback((data: LoginPayload) => {
        loginUserMutation.mutate(data, {
            onSuccess: (response) => {
                console.log('response:', response)
                const user = response.data.user;
                const token = response.data.token;
                localStorage.setItem('token', token)
                setUser(user);
                setToken(token);
                setIsAuthenticated(true);
            },
            onError: (err) => {
                setError(err);
                navigate('/login');
            }
        })
    }, [loginUserMutation, navigate]);

    const logout = useCallback((redirect?: string) => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.clear();
        navigate(redirect ? redirect : '/login');
    }, [navigate]);

    const register = useCallback((data: RegisterPayload) => {
        registerMutation.mutate(data, {
            onSuccess: () => {
                toast.success('Registered successfully');
                navigate('/login')
            },
            onError: () => {
                toast.success('Failed to register');
            }
        })
    }, [navigate, registerMutation])

    const contextValues = useMemo(() => ({
        user,
        token,
        isAuthenticated,
        error,
        login,
        logout,
        register,
        isLoading: loginUserMutation.isPending
    }), [error, isAuthenticated, login, loginUserMutation.isPending, logout, register, token, user]);

    return (
        <AuthContext.Provider value={contextValues}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('AuthContext should be used inside the AuthProvider')
    }
    return context;
}

export default AuthProvider;