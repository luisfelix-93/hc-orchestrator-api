import { Router } from "express";
import * as logController from './logs.controller';

const logRouter = Router();

logRouter.get('/', logController.list);
logRouter.get('/:endpointId', logController.findById)

export default logRouter;