import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import Lesson from '../models/Lesson'
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';

export default class LessonController {
  static async create(req: Request, res: Response) {
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" })
      return
    }

    if (!phone) {
      res.status(422).json({ message: "A telefone é obrigatório!" })
      return
    }

    if (!cpf) {
      res.status(422).json({ message: "O CPF é obrigatório!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lesson = new Lesson({
      name,
      phone,
      cpf,
      email,
      rg,
      birthdate,
      company: user.company
    })

    try {
      const newLesson = await lesson.save()
      res.status(201).json({ message: "Aluno cadastrado com sucesso!", newLesson })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lessons = await Lesson.find({ 'company': user.company }).sort('-createAt')

    res.status(200).json({ lessons: lessons })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const lesson = await Lesson.findOne({ _id: id })

    if (!lesson) {
      res.status(404).json({ message: "Aluno não encontrado!" })
      return
    }

    res.status(200).json({ lesson: lesson })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const lesson = await Lesson.findOne({ _id: id })

    if (!lesson) {
      res.status(404).json({ message: "Aluno não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    // if (user._id.toString() !== lesson.user._id.toString()) {
    //   res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })
    //   return
    // }

    await Lesson.findByIdAndRemove(id)

    res.status(200).json({ message: "Aluno removido com sucesso!" })
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const lesson = await Lesson.findOne({ _id: id })

    if (!lesson) {
      res.status(404).json({ message: "Aluno não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== lesson.company.toString()) {
      res.status(422).json({ message: "Houve um problema no processamento da edição!" })
      return
    }

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" })
      return
    }

    if (!phone) {
      res.status(422).json({ message: "A telefone é obrigatório!" })
      return
    }

    if (!cpf) {
      res.status(422).json({ message: "O CPF é obrigatório!" })
      return
    }

    const updatedData:any = {
      name: name,
      phone: phone,
      cpf: cpf,
      email: email,
      rg: rg,
      birthdate: birthdate,
    }

    await Lesson.findByIdAndUpdate(id, updatedData)

    res.status(200).json({ message: "Aluno atualizado com sucesso!" })
  }
}