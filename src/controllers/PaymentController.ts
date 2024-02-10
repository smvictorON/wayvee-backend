import Payment from '../models/Payment'
import bcrypt from 'bcrypt'
import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';

export default class PaymentController {
  static async create(req: Request, res: Response) {
    const {
      date,
      payer,
      receiver,
      value,
      method,
      type,
    } = req.body

    const err = validateInputData(date, payer, receiver, value, method, type)
    if (err != "")
      return res.status(422).json({ message: err });

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lesson = new Payment({
      date: new Date(date),
      payer,
      receiver,
      value,
      method,
      type,
      company: user.company
    })

    try {
      const newLesson = await lesson.save()
      return res.status(201).json({ message: "Registro lançado com sucesso!", newLesson })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err })
    }
  }


  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const payments = await Payment.find({ "company": user.company, "deletedAt": { "$exists": false } }).sort("date")

    return res.status(200).json({ payments: payments })
  }
}

const validateInputData = (date: any, payer: any, receiver: any, value: any, method: any, type: any): string => {
  if (!date)
    return "A data é obrigatória!"

  if (!value)
    return "O valor é obrigatório!"

  if (!method)
    return "Selecione um método de pagamento!"

  if (!type)
    return "Selecione o tipo!"

  if (!payer)
    return "O Pagante é obrigatório!"

  if (!receiver)
    return "O Recebedor é obrigatório!"

  return ""
}