import z from "zod";
import { Permissions, permissionSchema, PermissionTypes, recordPermissionSchema } from "./permissions";

export enum Roles {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export const roleSchema = z.object({
    name: z.string(),
    permissions: permissionSchema
});

export type TRole = z.infer<typeof roleSchema>;

const defaultRoleSchema = z.object({
    [Roles.ADMIN]: roleSchema.extend({
        name: z.literal(Roles.ADMIN),
        permissions: permissionSchema.extend({
            [PermissionTypes.RECORDS]: recordPermissionSchema.extend({
                [Permissions.CREATE]: z.boolean().default(true),
                [Permissions.DELETE]: z.boolean().default(true),
                [Permissions.READ]: z.boolean().default(true),
                [Permissions.UPDATE]: z.boolean().default(true),
            })
        })
    }),
    [Roles.USER]: roleSchema.extend({
        name: z.literal(Roles.USER),
        permissions: permissionSchema
    })
});

export const roleDefaults = defaultRoleSchema.parse({
    [Roles.ADMIN]: {
        name: Roles.ADMIN,
        permissions: {
            [PermissionTypes.RECORDS]: {
                [Permissions.CREATE]: true,
                [Permissions.DELETE]: true,
                [Permissions.READ]: true,
                [Permissions.UPDATE]: true,
            }
        }
    },
    [Roles.USER]: {
        name: Roles.USER,
        permissions: {
            [PermissionTypes.RECORDS]: { 
                [Permissions.CREATE]: true,
                [Permissions.DELETE]: false,
                [Permissions.READ]: true,
                [Permissions.UPDATE]: true,
            }
        }
    },
})