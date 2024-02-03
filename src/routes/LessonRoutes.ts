import { Router } from 'express';
import LessonController from '../controllers/LessonController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', verifyToken, imageUpload.array('images'), LessonController.create);
router.get('/', LessonController.getAll);
router.get('/:id', LessonController.getOne);
router.delete('/:id', verifyToken, LessonController.deleteOne);
router.patch('/:id', verifyToken, imageUpload.array('images'), LessonController.updateOne);

export default router;
