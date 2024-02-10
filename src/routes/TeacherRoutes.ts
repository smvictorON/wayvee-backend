import { Router } from 'express';
import TeacherController from '../controllers/TeacherController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', verifyToken, imageUpload.array('images'), TeacherController.create);
router.get('/', TeacherController.getAll);
router.get('/:id', TeacherController.getOne);
router.delete('/:id', verifyToken, TeacherController.softDeleteOne);
router.patch('/:id', verifyToken, imageUpload.array('images'), TeacherController.updateOne);

export default router;
