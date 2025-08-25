import express from "express";
import { connectDB } from "./db/connectDB";
import { initializeRoles, initializeUsers } from "./db/init";
import { recordRouter } from "./routes/record.route";
import { authRouter } from "./routes/auth.route";
import cors from 'cors';
import { userRouter } from "./routes/user.route";

const app = express();
app.use(cors({origin: '*'}));
app.use(express.json());
app.use('/record', recordRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.listen(3000, async () => {
    await connectDB();
    await initializeRoles();
    console.log('server started');
})