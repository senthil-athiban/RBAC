import z from 'zod';

export enum PermissionTypes {
    RECORDS = 'RECORDS'
}

export enum Permissions {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    READ = 'READ'
}

export const recordPermissionSchema = z.object({
    [Permissions.CREATE]: z.boolean().default(true),
    [Permissions.UPDATE]: z.boolean().default(true),
    [Permissions.DELETE]: z.boolean().default(false),
    [Permissions.READ]: z.boolean().default(true),
})

export type TRecordPermissions = z.infer<typeof recordPermissionSchema>;

export const permissionSchema = z.object({
    [PermissionTypes.RECORDS]: recordPermissionSchema
})