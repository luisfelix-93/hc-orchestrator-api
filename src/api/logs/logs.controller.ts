import * as logService from './logs.service'
import { Request, Response } from 'express';

export async function list(req: Request, res: Response) {
    const logs = await logService.getLogs();
    res.status(200).json(logs);
}

export async function findById(req: Request, res: Response) {
    try {
        const { endpointId } = req.params;
        const logs = await logService.getLogsByEndpointId(endpointId);
        console.log(`[Controller] 4. Enviando resposta com ${logs.length} logs.`);
        res.status(200).json(logs);
    } catch (error) {
        console.error('[Controller] ERRO em listLogsForEndpoint:', error);
        res.status(500).json({ error: 'Erro interno ao buscar os logs do endpoint.' })
    }

}