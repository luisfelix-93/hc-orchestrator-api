import express from 'express';
import endpointRoutes from './api/endpoints/endpoint.routes';
import logRouter from './api/logs/logs.routes';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => res.status(200).send('Orchestrator is healthy!'));

app.use('/api/endpoints', endpointRoutes);
app.use('/api/logs', logRouter);

export default app;