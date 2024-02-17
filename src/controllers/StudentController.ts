import getToken from "../helpers/get-token"
import getUserByToken from "../helpers/get-user-by-token"
import Student from "../models/Student"
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { setAudit } from "../helpers/set-audit";

export default class StudentController {
  static async create(req: Request, res: Response) {
    const { name, phone, cpf, address, email, rg, birthdate, gender } = req.body
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

    const student = new Student({
      name,
      phone,
      cpf,
      address: parsedAddress,
      email,
      rg,
      birthdate,
      gender,
      company: user.company
    })

    images.map((image: any) => student.images.push(image.filename))

    try {
      const newStudent = await student.save()
      return res.status(201).json({ message: "Aluno cadastrado com sucesso!", newStudent })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao cadastrar aluno!" })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    let students = []
    if(user.isSuper)
      students = await Student.find({ "deletedAt": { "$exists": false } }).sort("-name")
    else
      students = await Student.find({ "company": user.company, "deletedAt": { "$exists": false } }).sort("-name")

    return res.status(200).json({ students: students })
  }

  static async getOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const student = await Student.findOne({ _id: id })
    if (!student)
      return res.status(404).json({ message: "Aluno não encontrado!" })

    return res.status(200).json({ student: student })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const student = await Student.findOne({ _id: id })
    if (!student)
      return res.status(404).json({ message: "Aluno não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== student.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    try {
      await Student.findByIdAndRemove(id)
      return res.status(200).json({ message: "Aluno removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover aluno!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const student = await Student.findOne({ _id: id })
    if (!student)
      return res.status(404).json({ message: "Aluno não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== student.company.toString())
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    student.deletedAt = new Date()
    try {
      await Student.findByIdAndUpdate(id, student)
      return res.status(200).json({ message: "Aluno removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover aluno!" })
    }
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, phone, cpf, address, email, rg, birthdate, gender } = req.body
    const images: any = req.files

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const student = await Student.findOne({ _id: id })
    if (!student)
      return res.status(404).json({ message: "Aluno não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (user.company.toString() !== student.company.toString() && !user.isSuper)
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
      gender: gender,
    }

    if (images.length > 0) {
      updatedData.images = []
      images.map((image: any) => updatedData.images.push(image.filename))
    }

    try {
      const updated = await Student.findByIdAndUpdate(id, updatedData, { new: true })
      setAudit("Student", student._id, student.toObject(), updated?.toObject(), user._id, user.company)
      return res.status(200).json({ message: "Aluno atualizado com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao atualizar aluno!" })
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