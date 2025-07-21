import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHealthCheckLog extends Document {
    status: 'Online' | 'Offline';
    statusCode: number | null;
    responseTimeInMs: number;
    endpointId: mongoose.Schema.Types.ObjectId;
}

const healthCheckLogSchema: Schema = new Schema({
    status: { type: String, required: true },
    statusCode: { type: Number },
    responseTimeInMs: { type: Number, required: true },
    endpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'Endpoint', required: true },
}, { timestamps: { createdAt: true, updatedAt: true }});

export const HealthCheckLogModel: Model<IHealthCheckLog> = mongoose.model<IHealthCheckLog>('HealthCheckLog', healthCheckLogSchema);