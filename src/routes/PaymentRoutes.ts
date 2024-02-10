import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', verifyToken, imageUpload.array('images'), PaymentController.create);
router.get('/', PaymentController.getAll);

export default router;
