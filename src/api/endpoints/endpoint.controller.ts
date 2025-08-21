import { Request, Response } from 'express'
import * as endpointService from './endpoint.service';


export async function list(req: Request, res: Response) {
    const endpoints = await endpointService.getAllEndpoints();
    res.status(200).json(endpoints);
}

export async function create(req: Request, res: Response) {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
    }

    const newEndpoint = await endpointService.create(name, url);
    res.status(201).json(newEndpoint);
}

export async function deleteEndpoint(req: Request, res: Response) {
    const { id } = req.params;
    const deletedEndpoint = await endpointService.deleteEndpoint(id);
    if (!deletedEndpoint) {
        return res.status(404).json({ error: 'Endpoint não encontrado' });
    }
    return res.status(200).json(deletedEndpoint);
}

export async function getEndpointById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const endpoint = await endpointService.getEndpointById(id);
        if (!endpoint) {
            console.log(`[Controller] Endpoint com ID ${id} não encontrado.`);
            return res.status(404).json({ error: 'Endpoint não encontrado' });
        }
        console.log(`[Controller] 4. Enviando resposta com detalhes do endpoint.`);
        return res.status(200).json(endpoint);
    } catch (error) {
        console.error('[Controller] ERRO em findById:', error);
        res.status(500).json({ error: 'Erro interno ao buscar o endpoint.' });
    }

}