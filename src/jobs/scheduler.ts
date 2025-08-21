import cron from 'node-cron';
import { EndpointModel } from '../api/endpoints/endpoint.model';
import { healthCheckJobsQueue } from './queue';
import { config } from '../config';

let isJobRunning = false;

export function startScheduler() {
  console.log('⏰ Agendador iniciado. Verificando a cada minuto.');

  cron.schedule(config.cronSchedule, async () => {
    if (isJobRunning) {
      console.log('[NODE-CRON] [WARN] Tarefa anterior ainda em execução. Pulando esta execução para evitar sobreposição.');
      return;
    }

    isJobRunning = true;
    console.log('🗓️ Executando tarefa agendada: buscando endpoints para verificar...');

    try {
      let count = 0;
      for await (const endpoint of EndpointModel.find().select('url').cursor()) {
        console.log(`➕ Adicionando job para a URL: ${endpoint.url}`);
        await healthCheckJobsQueue.add('check', {
          url: endpoint.url,
          endpointId: endpoint.id,
        });
        count++;
      }

      if (count === 0) {
        console.log('Nenhum endpoint para verificar.');
      } else {
        console.log(`✅ ${count} jobs adicionados à fila.`);
      }
    } catch (error) {
      console.error('Erro ao buscar endpoints e agendar jobs:', error);
    } finally {
      isJobRunning = false;
    }
  });
}