import { Router } from 'express';
import StudentController from '../controllers/StudentController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', verifyToken, imageUpload.array('images'), StudentController.create);
router.get('/', StudentController.getAll);
router.get('/:id', StudentController.getOne);
router.delete('/:id', verifyToken, StudentController.softDeleteOne);
router.patch('/:id', verifyToken, imageUpload.array('images'), StudentController.updateOne);

export default router;
