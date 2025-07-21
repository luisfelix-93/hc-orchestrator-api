import mongoose from "mongoose";
import { config } from "../config";


export async function connectToDatabase() {
    try {
        await mongoose.connect(config.databeseUrl);
        console.log('✅ Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}