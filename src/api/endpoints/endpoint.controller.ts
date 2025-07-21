import { Request, Response } from 'express'
import * as endpointService from './endpoint.service';


export async function list(req: Request, res: Response) {
    const endpoints = await endpointService.getAllEndpoints();
    res.status(200).json(endpoints);
}

export async function create(req: Request, res: Response) {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).json({error: 'Nome e URL são obrigatórios'});
    }

    const newEndpoint = await endpointService.create(name, url);
    res.status(201).json(newEndpoint);
}