import Payment from '../models/Payment'
import bcrypt from 'bcrypt'
import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';
import { setAudit } from "../helpers/set-audit";
import { isValidObjectId } from "mongoose";

export default class PaymentController {
  static async create(req: Request, res: Response) {
    const { date, person, value, method, type, description} = req.body

    const err = validateInputData(date, value, method, type, description)
    if (err != "")
      return res.status(422).json({ message: err });

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lesson = new Payment({
      date: new Date(date),
      person,
      value,
      method,
      type,
      description,
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

    let payments
    if(user.isSuper)
      payments = await Payment.find({ "deletedAt": { "$exists": false } }).sort("date")
    else
      payments = await Payment.find({ "company": user.company, "deletedAt": { "$exists": false } }).sort("date")

    return res.status(200).json({ payments: payments })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const payment = await Payment.findOne({ _id: id })
    if (!payment)
      return res.status(404).json({ message: "Pagamento não encontrado!" })

    return res.status(200).json({ payment: payment })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const payment = await Payment.findOne({ _id: id })
    if (!payment)
      return res.status(404).json({ message: "Pagamento não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== payment.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    try {
      await Payment.findByIdAndRemove(id)
      return res.status(200).json({ message: "Pagamento removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover pagamento!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const payment = await Payment.findOne({ _id: id })
    if (!payment)
      return res.status(404).json({ message: "Pagamento não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== payment.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    payment.deletedAt = new Date()
    try {
      await Payment.findByIdAndUpdate(id, payment)
      return res.status(200).json({ message: "Pagamento removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover pagamento!" })
    }
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { date, value, method, type, description } = req.body

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const payment = await Payment.findOne({ _id: id })
    if (!payment)
      return res.status(404).json({ message: "Pagamento não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== payment.company.toString() && !user.isSuper)
      return res.status(422).json({ message: "Houve um problema no processamento da edição!" })

    const err = validateInputData(date, value, method, type, description)
    if (err != "")
      return res.status(422).json({ message: err });

    const updatedData: any = {
      date: new Date(date),
      value: value,
      method: method,
      type: type,
      description: description,
    }

    try {
      const updated = await Payment.findByIdAndUpdate(id, updatedData, { new: true })
      setAudit("Payment", payment._id, payment.toObject(), updated?.toObject(), user._id, user.company)
      return res.status(200).json({ message: "Pagamento atualizado com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao atualizar pagamento!" })
    }
  }
}

const validateInputData = (date: any, value: any, method: any, type: any, description: any): string => {
  if (!date)
    return "A data é obrigatória!"

  if (!value)
    return "O valor é obrigatório!"

  if (!method)
    return "Selecione um método de pagamento!"

  if (!type)
    return "Selecione o tipo!"

  if (!description)
    return "A descrição é obrigatória!"

  return ""
}