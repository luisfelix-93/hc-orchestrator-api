import app from './app';
import { config } from './config';
import { startScheduler } from './jobs/scheduler';
import { startResultsWorker } from './jobs/results.worker';
import { connectToDatabase } from './lib/database';

async function main() {

  await connectToDatabase();

  startScheduler();
  startResultsWorker();

  app.listen(config.apiPort, () => {
    console.log(`🚀 API do Orquestrador rodando na porta ${config.apiPort}`);
  });
}

main();