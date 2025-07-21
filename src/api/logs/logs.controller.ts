import * as logService from './logs.service'
import { Request, Response } from 'express';

export async function list(req: Request, res: Response) {
    const logs = await logService.getLogs();
    res.status(200).json(logs);
}

    export async function findById(req: Request, res: Response) {
        const { endpointId } = req.params;
        const logs = await logService.getLogsByEndpointId(endpointId);
        res.status(200).json(logs);
    }