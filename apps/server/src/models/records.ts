import mongoose, { Schema } from 'mongoose';

const recordsSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

export const Record = mongoose.model('Record', recordsSchema);