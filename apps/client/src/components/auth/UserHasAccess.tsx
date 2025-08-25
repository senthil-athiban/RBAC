import useHasAccess from '@/hooks/useHasAccess';
import React from 'react'
import { Permissions, PermissionTypes } from "core"

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    permissionType: PermissionTypes;
    permissions: Permissions | Permissions[];
}

const UserHasAccess = ({ children, fallback, permissionType, permissions }: Props) => {
    const hasAccess = useHasAccess({ permissionType, permissions });
    if(!hasAccess) return fallback ? <>{fallback}</> : null;
    return <>{children}</>
}

export default UserHasAccess