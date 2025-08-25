import { Request, Response, Router } from "express";
import authenticateJWT from "../middleware/auth";
import { User } from "../models/user";

const router = Router();
router.use(authenticateJWT);

router.get('/me', async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const currUser = await User.findOne({ _id: user.id }).populate('role');
        return res.status(200).json({ user: currUser });
    } catch (error) {
        return res.status(401).json({ message: 'Un authorized' });
    }
});

export const userRouter = router;