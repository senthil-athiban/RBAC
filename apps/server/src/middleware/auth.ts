import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')?.[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //@ts-ignore
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Un Authorized" });
    }
}

export default authenticateJWT;