import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { UserDocument } from '../models/User';

const createUserToken = async (user: UserDocument, req: Request, res: Response) => {
  const token = jwt.sign({
    name: user.name,
    id: user._id
  }, "nossosecret")

  res.status(200).json({ message: "Você está autenticado", token: token, userId: user._id })
}

export default createUserToken