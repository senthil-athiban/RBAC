import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    role: Types.ObjectId;
}
const userSchema: Schema<IUser> = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
        type: mongoose.Schema.Types.ObjectId, // Reference by ObjectId
        ref: 'Role',                          // Reference the 'Role' model
        required: true,
    }
});

export const User = mongoose.model('User', userSchema);