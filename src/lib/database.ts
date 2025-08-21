import mongoose from "mongoose";
import { config } from "../config";


export async function connectToDatabase() {
    try {
        await mongoose.connect(config.databaseUrl);
        console.log('✅ Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}