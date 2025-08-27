import { HealthCheckLogModel } from "./logs.models";


export async function getLogs() {
    return HealthCheckLogModel.find()
        .sort({ createdAt: -1 })
        .limit(200);
}

export async function getLogsByEndpointId(endpointId: string, page: number = 1, limit: number = 100) {
    console.log(`[Service] 2. Consultando o MongoDB por Endpoint ID: ${endpointId}`);
    const result = await HealthCheckLogModel.find({ endpointId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    console.log(`[Service] 3. Consulta ao MongoDB por Endpoint finalizada.`);
    return result;
}