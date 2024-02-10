import getToken from "../helpers/get-token"
import getUserByToken from "../helpers/get-user-by-token"
import Lesson from "../models/Lesson"
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";

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

    const err = validateInputData(date, hour_start, hour_end, teacher, students)
    if (err != "")
      return res.status(422).json({ message: err });

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lesson = new Lesson({
      date: new Date(date),
      hour_start,
      hour_end,
      teacher,
      students: students.split(","),
      classroom,
      subject,
      observation,
      company: user.company
    })

    try {
      const newLesson = await lesson.save()
      return res.status(201).json({ message: "Aula cadastrada com sucesso!", newLesson })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const lessons = await Lesson.find({ "company": user.company, "deletedAt": { "$exists": false } })
      .populate("teacher")
      .populate("students")
      .sort("date")

    return res.status(200).json({ lessons: lessons })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const lesson = await Lesson.findOne({ _id: id })

    if (!lesson)
      return res.status(404).json({ message: "Aula não encontrada!" })

    return res.status(200).json({ lesson: lesson })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const lesson = await Lesson.findOne({ _id: id })
    if (!lesson)
      return res.status(404).json({ message: "Aula não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== lesson.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    try {
      await Lesson.findByIdAndRemove(id)
      return res.status(200).json({ message: "Aula removida com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover a aula!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const lesson = await Lesson.findOne({ _id: id })
    if (!lesson)
      return res.status(404).json({ message: "Aula não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== lesson.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    lesson.deletedAt = new Date()
    try {
      await Lesson.findByIdAndUpdate(id, lesson)
      return res.status(200).json({ message: "Aula removida com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover a aula!" })
    }
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

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const lesson = await Lesson.findOne({ _id: id })
    if (!lesson)
      return res.status(404).json({ message: "Aula não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== lesson.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da edição!" })

    const err = validateInputData(date, hour_start, hour_end, teacher, students)
    if (err != "")
      return res.status(422).json({ message: err });

    const updatedData: any = {
      date: new Date(date),
      hour_start,
      hour_end,
      teacher,
      students: students.split(","),
      classroom,
      subject,
      observation,
    }

    try {
      await Lesson.findByIdAndUpdate(id, updatedData)
      return res.status(200).json({ message: "Aula atualizada com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao atualizar aula!" })
    }
  }
}

const compareDatesWithoutTime = (dateA: Date, dateB: Date) => {
  const yearA = dateA.getFullYear();
  const monthA = dateA.getMonth();
  const dayA = dateA.getDate();

  const yearB = dateB.getFullYear();
  const monthB = dateB.getMonth();
  const dayB = dateB.getDate();

  if (yearA !== yearB) return yearA - yearB;
  if (monthA !== monthB) return monthA - monthB;
  return dayA - dayB;
}

const validateInputData = (date: any, hour_start: any, hour_end: any, teacher: any, students: any): string => {
  if (!date)
    return "A data é obrigatória!"

  const currentDate = new Date();
  const receivedDate = new Date(`${date}T03:00:00`);

  if (compareDatesWithoutTime(receivedDate, currentDate) < 0)
    return "A data não pode ser menor que o dia atual!"

  if (!hour_start || !hour_end)
    return "O horário é obrigatório!"

  const startHour = new Date(`1970-01-01T${hour_start}`);
  const endHour = new Date(`1970-01-01T${hour_end}`);

  if (startHour >= endHour)
    return "O horário de término deve ser maior que o horário de início!"

  if (!teacher)
    return "Selecione um professor!"

  const studentsArr = students.split(",")

  if (!studentsArr || studentsArr.length === 0 || students === "")
    return "Selecione ao menos um aluno!"

  return ""
}