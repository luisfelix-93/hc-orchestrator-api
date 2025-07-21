import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEndpoint extends Document {
    name: string,
    url: string
}


const endpointSchema: Schema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
}, { timestamps: true });


export const EndpointModel: Model<IEndpoint> = mongoose.model<IEndpoint>('Endpoint', endpointSchema);