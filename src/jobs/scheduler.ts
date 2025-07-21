import cron from 'node-cron';
import { EndpointModel } from '../api/endpoints/endpoint.model';
import { healthCheckJobsQueue } from './queue';

export function startScheduler() {
  console.log('⏰ Agendador iniciado. Verificando a cada minuto.');

  // VERIFIQUE ESTA LINHA: O primeiro argumento DEVE ser a string de tempo.
  cron.schedule('*/1 * * * *', async () => {
    console.log('🗓️ Executando tarefa agendada: buscando endpoints para verificar...');

    try {
      const endpoints = await EndpointModel.find();

      if (endpoints.length === 0) {
        console.log('Nenhum endpoint para verificar.');
        return;
      }

      for (const endpoint of endpoints) {
        await healthCheckJobsQueue.add('check', {
          url: endpoint.url,
          endpointId: endpoint.id,
        });
        console.log(`➕ Job adicionado para a URL: ${endpoint.url}`);
      }
    } catch (error) {
      console.error('Erro ao buscar endpoints e agendar jobs:', error);
    }
  });
}