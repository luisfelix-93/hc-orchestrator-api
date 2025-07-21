import { NextFunction, Request, Response } from "express";
import { config } from "../../config";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso não autorizado: token não fornecido.'});
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token invélido.'});        
    }

    const token = parts[1];
    if (token !== config.apiSecret) {
        res.status(401).json({ error: 'Acesso negado: token inválido.' });
    }

    next();
}