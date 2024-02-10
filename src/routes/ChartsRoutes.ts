import { Router } from 'express';
import ChartsController from '../controllers/ChartsController';

const router = Router();

router.get('/:companyId', ChartsController.chart);

export default router;
