import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import Lesson from '../models/Lesson'
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';

export default class LessonController {
  static async create(req: Request, res: Response) {
    const {
      date,
      hour_start,
      hour_end,
      teacher,
      students,
      classroom,
      subject,
      observation,
    } = req.body

    if (!date) {
      res.status(422).json({ message: "A data é obrigatória!" })
      return
    }

    if (!hour_start || !hour_end) {
      res.status(422).json({ message: "A horário é obrigatório!" })
      return
    }

    if (!teacher) {
      res.status(422).json({ message: "Selecione um professor!" })
      return
    }

    const studentsArr = students.split(',')
    if (!studentsArr || studentsArr.length === 0) {
      res.status(422).json({ message: "Selecione ao menos um aluno!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lesson = new Lesson({
      date,
      hour_start,
      hour_end,
      teacher,
      students: studentsArr,
      classroom,
      subject,
      observation,
      company: user.company
    })

    try {
      const newLesson = await lesson.save()
      res.status(201).json({ message: "Aula cadastrada com sucesso!", newLesson })
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
      res.status(404).json({ message: "Aula não encontrada!" })
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
      res.status(404).json({ message: "Aula não encontrada!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    // if (user._id.toString() !== lesson.user._id.toString()) {
    //   res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })
    //   return
    // }

    await Lesson.findByIdAndRemove(id)

    res.status(200).json({ message: "Aula removida com sucesso!" })
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const {
      date,
      hour_start,
      hour_end,
      teacher,
      students,
      classroom,
      subject,
      observation,
    } = req.body

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const lesson = await Lesson.findOne({ _id: id })

    if (!lesson) {
      res.status(404).json({ message: "Aula não encontrada!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== lesson.company.toString()) {
      res.status(422).json({ message: "Houve um problema no processamento da edição!" })
      return
    }

    if (!date) {
      res.status(422).json({ message: "A data é obrigatória!" })
      return
    }

    if (!hour_start || !hour_end) {
      res.status(422).json({ message: "A horário é obrigatório!" })
      return
    }

    if (!teacher) {
      res.status(422).json({ message: "Selecione um professor!" })
      return
    }

    if (!students || students.length === 0) {
      res.status(422).json({ message: "Selecione ao menos um aluno!" })
      return
    }

    const updatedData:any = {
      date,
      hour_start,
      hour_end,
      teacher,
      students,
      classroom,
      subject,
      observation,
    }

    await Lesson.findByIdAndUpdate(id, updatedData)

    res.status(200).json({ message: "Aula atualizada com sucesso!" })
  }
}