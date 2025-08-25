import { useAuth } from "@/context/auth.context";
import { Permissions, PermissionTypes } from "core";
import { useCallback, useMemo } from "react";


interface Props {
    permissionType?: PermissionTypes;
    permissions?: Permissions | Permissions[];
};

const useHasAccess = ({ permissionType, permissions }:Props) => {
    const { user } = useAuth();
    const rolePermissions = user?.role?.permissions;
    
    const checkAccess = useCallback(() => {
        if(!permissionType || !user) return false;

        // retrieve permission for resource type
        const resourcePermission = rolePermissions?.[permissionType];
        if(!resourcePermission) return false;

        // verify the permission access
        if(typeof permissions === 'string') {
            return resourcePermission[permissions] === true;
        } else if(Array.isArray(permissions)) {
            return permissions.every((pm) => resourcePermission?.[pm] === true);
        }

        return false;
    },[permissionType, permissions, rolePermissions, user]);

    const hasAccess = useMemo(() => checkAccess(),[checkAccess]);
    return hasAccess;
}

export default useHasAccess