import { EndpointModel } from "./endpoint.model";

export async function getAllEndpoints() {
    return EndpointModel.find();
}

export async function create(name: string, url: string) {
    return EndpointModel.create({ name, url });
}

export async function deleteEndpoint(id: string) {
    return EndpointModel.findByIdAndDelete(id);

}

export async function getEndpointById(id: string) {
    console.log(`[Service] 2. Consultando o MongoDB por Endpoint ID: ${id}`);
    const result = await EndpointModel.findById(id);
    console.log(`[Service] 3. Consulta ao MongoDB por Endpoint finalizada.`);
    return result;
}