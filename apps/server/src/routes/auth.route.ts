import { Request, Response, Router } from "express";
import { User } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { Role } from "../models/role";
import authenticateJWT from "../middleware/auth";
const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Invalid email or password ' });
        try {

            
            const user = await User.findOne({ email });
            if (user) {
                return res.status(409).json({ message: 'User already exists ' });
            }

            const systemRole = await Role.findOne({ name: role });
            console.log('systemRole:', systemRole)
            if(!systemRole) {
                return res.status(400).json({ message: 'No role exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await new User({ email, password: hashedPassword, role: systemRole._id }).save();

            return res.status(201).json({ message: 'Registered Successfully ' });
        } catch (error) {
            console.log('failed to register user:', error);
            return res.status(500).json({ error: 'Failed to register user' });
        }
    } catch (error) {
        console.log('failed to register user:', error);
        return res.status(500).json({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Invalid email or password ' });

        try {
            const user = await User.findOne({ email }).populate('role');
            if (!user) {
                return res.status(409).json({ message: 'No User exists ' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('isMatch:', isMatch)
            if(!isMatch) {
                return res.status(401).json({ error: 'Invalid password '});
            }
            
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role }, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '1h' }
            );
            return res.status(200).json({ token, user });
        } catch (error) {
            console.log('failed to register user:', error);
            throw new Error('Failed to register user');
        }
    } catch (error) {
        console.log('failed to register user:', error);
        return res.status(500).json('Failed to register user');
    }
});


router.get('/verify', authenticateJWT, async (req, res) => {
    return res.status(200).json({ message: 'JWT verified'});
})
export const authRouter = router;
