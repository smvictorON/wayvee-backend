import Payment from '../models/Payment'
import bcrypt from 'bcrypt'
import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';

export default class PaymentController {
  static async payment(req: Request, res: Response) {

  }


  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const payments = await Payment.find({ "company": user.company, "deletedAt": { "$exists": false } }).sort("date")

    return res.status(200).json({ payments: payments })
  }
}