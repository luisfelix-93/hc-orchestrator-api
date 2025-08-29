import lag from 'event-loop-lag'; // 1. Importe a biblioteca

// 2. Crie uma instância do detector
const lagDetector = lag(1000); // Define a resolução da medição para 1s

// 3. Crie um 'timer' que irá verificar o atraso a cada segundo
setInterval(() => {
  const delay = lagDetector(); // Pega o atraso (lag) em milissegundos

  // Se o atraso for maior que um limite razoável (ex: 50ms), avise-nos!
  if (delay > 50) {
    console.error(`[EVENT LOOP LAG] ⚠️  Atraso crítico detectado no event loop: ${delay.toFixed(2)}ms`);
  }
}, 1000);
import app from './app';
import { config } from './config';
import { startResultsWorker } from './jobs/results.worker';
import { startSchedulerWorker } from './jobs/scheduler.worker';
import { connectToDatabase } from './lib/database';
import { schedulerQueue } from './jobs/queue';
import * as dotenv from 'dotenv'
dotenv.config();

async function main() {

  try {


    await connectToDatabase(); 
    await schedulerQueue.clean(0, 1000, 'completed');
    await schedulerQueue.clean(0, 1000, 'wait');
    await schedulerQueue.clean(0, 1000, 'active');
    await schedulerQueue.clean(0, 1000, 'failed')
    await schedulerQueue.removeRepeatableByKey('*'); 

    // Adiciona o job que vai rodar a cada minuto
    await schedulerQueue.add(
      'run-health-checks',
      {}, // Nenhum dado é necessário, ele é apenas um gatilho
      {
        repeat: {
          every:  parseInt(process.env.CRON_SCHEDULER || '60000', 10), // 60 segundos em milissegundos
        },
        jobId: 'main-scheduler', // ID fixo para não criar duplicatas
      }
    );
    console.log('🔄️ Job de agendamento repetível configurado no BullMQ.');
    startSchedulerWorker();
    startResultsWorker();

    app.listen(config.apiPort, () => {
      console.log(`🚀 API do Orquestrador rodando na porta ${config.apiPort}`);

      // Adiciona log de uso de memória a cada minuto
      setInterval(() => {
        const mu = process.memoryUsage();
        console.log(`[Memory Usage] RSS: ${(mu.rss / 1024 / 1024).toFixed(2)} MB, Heap Total: ${(mu.heapTotal / 1024 / 1024).toFixed(2)} MB, Heap Used: ${(mu.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      }, 60 * 1000); // Log a cada 1 minuto
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }

}

main();