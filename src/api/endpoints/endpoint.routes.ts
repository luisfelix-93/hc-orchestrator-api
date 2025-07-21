import { Router } from "express";
import * as endpointController from './endpoint.controller';

const router = Router();

router.get('/', endpointController.list);
router.post('/', endpointController.create);

export default router;