import { Router } from 'express';
import UserController from '../controllers/UserController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);

router.patch('/edit/:id', verifyToken, imageUpload.single('image'), UserController.editUser);

export default router;