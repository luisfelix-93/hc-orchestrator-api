import { HealthCheckLogModel } from "./logs.models";


export async function getLogs() {
    return HealthCheckLogModel.find()
        .sort({ createdAt: -1 })
        .limit(200);
}

export async function getLogsByEndpointId(endpointId: string) {
    console.log(`[Service] 2. Consultando o MongoDB por Endpoint ID: ${endpointId}`);
    const result = await HealthCheckLogModel.find({ endpointId })
        .sort({ createdAt: -1 })
        .limit(200);
    console.log(`[Service] 3. Consulta ao MongoDB por Endpoint finalizada.`);
    return result;
}