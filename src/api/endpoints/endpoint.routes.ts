import { Router } from "express";
import * as endpointController from './endpoint.controller';

const router = Router();

router.get('/', endpointController.list);
router.post('/', endpointController.create);
router.delete('/:id', endpointController.deleteEndpoint);
router.get('/:id', endpointController.getEndpointById)
export default router;