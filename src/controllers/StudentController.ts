import getToken from '../helpers/get-token'
import getUserByToken from '../helpers/get-user-by-token'
import Student from '../models/Student'
import { isValidObjectId } from 'mongoose';
import { Request, Response } from 'express';

export default class StudentController {
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

    const student = new Student({
      name,
      phone,
      cpf,
      address: parsedAddress,
      email,
      rg,
      birthdate,
      company: user.company
    })

    images.map((image: any) => student.images.push(image.filename))

    try {
      const newStudent = await student.save()
      res.status(201).json({ message: "Aluno cadastrado com sucesso!", newStudent })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const students = await Student.find({ 'company': user.company }).sort('-createAt')

    res.status(200).json({ students: students })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const student = await Student.findOne({ _id: id })

    if (!student) {
      res.status(404).json({ message: "Aluno não encontrado!" })
      return
    }

    res.status(200).json({ student: student })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const student = await Student.findOne({ _id: id })

    if (!student) {
      res.status(404).json({ message: "Pet não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    // if (user._id.toString() !== student.user._id.toString()) {
    //   res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })
    //   return
    // }

    await Student.findByIdAndRemove(id)

    res.status(200).json({ message: "Pet removido com sucesso!" })
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    if (!isValidObjectId(id)) {
      res.status(422).json({ message: "Id inválido!" })
      return
    }

    const student = await Student.findOne({ _id: id })

    if (!student) {
      res.status(404).json({ message: "Pet não encontrado!" })
      return
    }

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== student.company.toString()) {
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

    await Student.findByIdAndUpdate(id, updatedData)

    res.status(200).json({ message: "Aluno atualizado com sucesso!" })
  }
}