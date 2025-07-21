import { EndpointModel } from "./endpoint.model";

export async function getAllEndpoints() {
    return EndpointModel.find();
}

export async function create(name: string, url: string) {
    return EndpointModel.create({ name, url });
}