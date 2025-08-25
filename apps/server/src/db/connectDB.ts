import mongoose from "mongoose";
import { config } from "dotenv";
config();

let cachedConnection: typeof mongoose | null= null;

export const connectDB = async (): Promise<typeof mongoose> => {
    
    console.log('process.env.MONGO_URI:', process.env.MONGO_URI);
    if(!process.env.MONGO_URI) throw new Error('MONGO_URI is not provided')

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        cachedConnection = connection;
        console.log('Mongo DB connected successfully');
        return connection;
    } catch (error) {
        console.log('[DB]', 'Failed to connect MongoDB:', error);
        throw error;
    }
}

export const mockConnectDb = async () => {console.log('db')}