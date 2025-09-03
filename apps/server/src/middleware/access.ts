import { NextFunction, Request, Response } from "express";
import { Permissions, PermissionTypes } from "../schema/permissions";
import { Role } from "../models/role";

export const hasAccess = async (permissionType: PermissionTypes, permissions: Permissions | Permissions[], user: { id: string, email: string, role: string }): Promise<boolean> => {
    
    try {
        const foundRole = await Role.findOne({ _id: user.role })
        const rolePermissions = foundRole.permissions;
        const resourcePermissions = rolePermissions[permissionType];

        if(Array.isArray(permissions)) {
            return permissions.every(pm => resourcePermissions[pm] === true);
        } else if(typeof permissions === 'string') {
            return resourcePermissions[permissions] === true
        } 
        return false;
    } catch (error) {
        console.log('Failed to check access:', error);
    }
    
}

export const generateAccess = (permissionType: PermissionTypes, permissions: Permissions | Permissions[]) => async (req: Request, res: Response, nxt: NextFunction) => {
    try {
        const user = req.user;
        const access = await hasAccess(permissionType, permissions, user);
        if(access) {
            return nxt();
        }
        return res.status(403).json({ message: 'Insufficient permissions' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
}