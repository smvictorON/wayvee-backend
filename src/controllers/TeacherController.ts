import getToken from "../helpers/get-token"
import getUserByToken from "../helpers/get-user-by-token"
import Teacher from "../models/Teacher"
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";

export default class TeacherController {
  static async create(req: Request, res: Response) {
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    const err = validateInputData(name, phone, cpf, email, rg)
    if (err != "")
      return res.status(422).json({ message: err });

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    let parsedAddress
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      console.log(err)
      return res.status(422).json({ message: "Endereço inválido!" });
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
      return res.status(201).json({ message: "Professor cadastrado com sucesso!", newTeacher })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    const teachers = await Teacher.find({ "company": user.company, "deletedAt": { "$exists": false } }).sort("-name")

    return res.status(200).json({ teachers: teachers })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const teacher = await Teacher.findOne({ _id: id })
    if (!teacher)
      return res.status(404).json({ message: "Professor não encontrado!" })

    return res.status(200).json({ teacher: teacher })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const teacher = await Teacher.findOne({ _id: id })
    if (!teacher)
      return res.status(404).json({ message: "Professor não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== teacher.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    try {
      await Teacher.findByIdAndRemove(id)
      return res.status(200).json({ message: "Professor removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover professor!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const teacher = await Teacher.findOne({ _id: id })
    if (!teacher)
      return res.status(404).json({ message: "Professor não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== teacher.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    teacher.deletedAt = new Date()
    try {
      await Teacher.findByIdAndUpdate(id, teacher)
      return res.status(200).json({ message: "Professor removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover professor!" })
    }
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, phone, cpf, address, email, rg, birthdate } = req.body
    const images: any = req.files

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const teacher = await Teacher.findOne({ _id: id })
    if (!teacher)
      return res.status(404).json({ message: "Professor não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== teacher.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da edição!" })

    const err = validateInputData(name, phone, cpf, email, rg)
    if (err != "")
      return res.status(422).json({ message: err });

    let parsedAddress
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      console.log(err)
      return res.status(422).json({ message: "Endereço inválido!" });
    }

    const updatedData: any = {
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

    try {
      await Teacher.findByIdAndUpdate(id, updatedData)
      return res.status(200).json({ message: "Professor atualizado com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao atualizar professor!" })
    }
  }
}

const validateInputData = (name: any, phone: any, cpf: any, email: any, rg: any): string => {
  if (!name)
    return "O nome é obrigatório!"

  if (!phone)
    return "A telefone é obrigatório!"

  if (!cpf)
    return "O CPF é obrigatório!"

  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
  const isValidCpf = cpfRegex.test(cpf);

  if (!isValidCpf)
    return "O CPF está fora do padrão!"

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);

    if (!isValidEmail)
      return "O email está fora do padrão!"
  }

  if (rg) {
    const rgRegex = /^\d{1,2}\.\d{3}\.\d{3}\-[\d|X]$/;
    const isValidRg = rgRegex.test(rg.toUpperCase());

    if (!isValidRg)
      return "O rg está fora do padrão!"
  }

  return ""
}