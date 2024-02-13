import { Router } from 'express';
import CompanyController from '../controllers/CompanyController';
import verifyToken from '../helpers/verify-token';
import imageUpload from '../helpers/image-upload';

const router = Router();

router.post('/create', verifyToken, imageUpload.array('images'), CompanyController.create);
router.get('/', verifyToken, CompanyController.getAll);
router.get('/:id', verifyToken, CompanyController.getOne);
router.delete('/:id', verifyToken, CompanyController.softDeleteOne);
router.patch('/:id', verifyToken, imageUpload.array('images'), CompanyController.updateOne);

export default router;
