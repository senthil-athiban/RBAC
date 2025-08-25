import type { TPermission } from 'core';
export interface LoginPayload { email: string, password: string };

interface IUser {
    email: string;
    name: string;
    role: {
        name: 'ADMIN' | 'USER';
        permissions?: TPermission
    }
};

export interface LoginResponse {
    token: string;
    user: IUser;
};

export interface RegisterPayload {
    email: string;
    password: string;
    role: 'ADMIN' | 'USER'
}

export interface UserResponse {
    user:  IUser;
}