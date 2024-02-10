import jwt from 'jsonwebtoken'
import getToken from './get-token'
import { Response, Request, NextFunction } from 'express';

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado!" })
  }

  const token = getToken(req)
  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" })
  }

  try {
    const verified = jwt.verify(token, 'wayveesecret')
    req.user = verified
    next()
  } catch (err) {
    return res.status(400).json({ message: "Token inválido!" })
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


export default checkToken