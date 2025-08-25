import mongoose, { Schema, Document } from 'mongoose'
import { PermissionTypes, Permissions } from "core";

export interface IRole extends Document {
    name: string;
    permissions: {
        [PermissionTypes.RECORDS]: {
            [Permissions.CREATE]: boolean
            [Permissions.DELETE]: boolean
            [Permissions.READ]: boolean
            [Permissions.UPDATE]: boolean
        }
    }
}

const permissionSchema = new Schema({
    [PermissionTypes.RECORDS]: {
        [Permissions.CREATE]: { type: Boolean, default: true },
        [Permissions.DELETE]: { type: Boolean, default: true },
        [Permissions.READ]: { type: Boolean, default: true },
        [Permissions.UPDATE]: { type: Boolean, default: true },
    }
}, {
    _id: false
});

const roleSchema: Schema<IRole> = new Schema({
    name: { type: String, required: true, unique: true, index: true },
    permissions: { type: permissionSchema }
});

export default roleSchema;