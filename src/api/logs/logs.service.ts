import { HealthCheckLogModel } from "./logs.models";


export async function getLogs() {
    return HealthCheckLogModel.find()
    .sort({createdAt: -1})
    .limit(200);
}

export async function getLogsByEndpointId(endpointId: string) {
    return HealthCheckLogModel.find({endpointId})
    .sort({createdAt: -1})
    .limit(200)
}