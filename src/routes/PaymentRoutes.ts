import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';

const router = Router();

router.get('/', PaymentController.getAll);

export default router;
