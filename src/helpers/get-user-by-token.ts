import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../models/User'
import { Response } from 'express';

const getUserByToken = async (token: string | undefined, res: Response): Promise<any> => {
  if (!token)
    return res.status(401).json({ message: "Acesso negado!" })

  const decoded = jwt.verify(token, 'wayveesecret') as JwtPayload
  const userId = decoded.id
  const user = await User.findById(userId)
  return user
}

export default getUserByToken