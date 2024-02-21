import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';

const createUserToken = async (user: any, req: Request, res: Response) => {
  const token = jwt.sign({
    name: user.name,
    company: user.company._id,
    id: user._id
  }, "wayveesecret")

  return res.status(200).json({
    message: "Você está autenticado",
    token: token,
    userId: user._id,
    company: user.company._id,
    isSuper: user.isSuper === true
  })
}

export default createUserToken