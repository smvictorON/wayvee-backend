import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import Teacher from '../models/Teacher'
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';

export default class TeacherController {
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

    let parsedAddress
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      res.status(422).json({ message: "Endereço inválido!" });
      return;
    }

    const teacher = new Teacher({
      name,
      phone,
      cpf,
      address: parsedAddress,
      email,
      rg,
      birthdate,
      company: user.company
    })

    images.map((image: any) => teacher.images.push(image.filename))

    try {
      const newTeacher = await teacher.save()
      res.status(201).json({ message: "Professor cadastrado com sucesso!", newTeacher })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const teachers = await Teacher.find({ 'company': user.company }).sort('-createdAt')

    res.status(200).json({ teachers: teachers })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const teacher = await Teacher.findOne({ _id: id })

    if (!teacher) {
      res.status(404).json({ message: "Professor não encontrado!" })
      return
    }

    res.status(200).json({ teacher: teacher })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const teacher = await Teacher.findOne({ _id: id })

    if (!teacher) {
      res.status(404).json({ message: "Professor não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    // if (user._id.toString() !== teacher.user._id.toString()) {
    //   res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })
    //   return
    // }

    await Teacher.findByIdAndRemove(id)

    res.status(200).json({ message: "Professor removido com sucesso!" })
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const teacher = await Teacher.findOne({ _id: id })

    if (!teacher) {
      res.status(404).json({ message: "Professor não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== teacher.company.toString()) {
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

    let parsedAddress
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      res.status(422).json({ message: "Endereço inválido!" });
      return;
    }

    const updatedData:any = {
      name: name,
      phone: phone,
      cpf: cpf,
      address: parsedAddress,
      email: email,
      rg: rg,
      birthdate: birthdate,
    }

    if (images.length > 0) {
      updatedData.images = []
      images.map((image: any) => updatedData.images.push(image.filename))
    }

    await Teacher.findByIdAndUpdate(id, updatedData)

    res.status(200).json({ message: "Professor atualizado com sucesso!" })
  }
}