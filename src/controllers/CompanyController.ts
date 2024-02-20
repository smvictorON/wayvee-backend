import getToken from "../helpers/get-token"
import getUserByToken from "../helpers/get-user-by-token"
import Company from "../models/Company"
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { setAudit } from "../helpers/set-audit";

export default class CompanyController {
  static async create(req: Request, res: Response) {
    const { name, cnpj, email, phone, address } = req.body
    const images: any = req.files

    const err = validateInputData(name, cnpj, email, phone)
    if (err != "")
      return res.status(422).json({ message: err });

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    let parsedAddress
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      console.log(err)
      return res.status(422).json({ message: "Endereço inválido!" });
    }

    const company = new Company({
      name,
      cnpj,
      email,
      phone,
      address: parsedAddress,
    })

    images.map((image: any) => company.images.push(image.filename))

    try {
      const newCompany = await company.save()
      return res.status(201).json({ message: "Empresa cadastrada com sucesso!", newCompany })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao cadastrar empresa!" })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    const companies = await Company.find({ "deletedAt": { "$exists": false } }).sort("-name")

    return res.status(200).json({ companies: companies })
  }

  static async getOne(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const company = await Company.findOne({ _id: id })
    if (!company)
      return res.status(404).json({ message: "Empresa não encontrada!" })

    return res.status(200).json({ company: company })
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const company = await Company.findOne({ _id: id })
    if (!company)
      return res.status(404).json({ message: "Empresa não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    try {
      await Company.findByIdAndRemove(id)
      return res.status(200).json({ message: "Empresa removida com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover empresa!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const company = await Company.findOne({ _id: id })
    if (!company)
      return res.status(404).json({ message: "Empresa não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    company.deletedAt = new Date()
    try {
      await Company.findByIdAndUpdate(id, company)
      return res.status(200).json({ message: "Empresa removida com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover empresa!" })
    }
  }

  static async updateOne(req: Request, res: Response) {
    const id = req.params.id
    const { name, cnpj, email, phone, address } = req.body
    const images: any = req.files

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const company = await Company.findOne({ _id: id })
    if (!company)
      return res.status(404).json({ message: "Empresa não encontrada!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    const err = validateInputData(name, cnpj, email, phone)
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
      cnpj: cnpj,
      email: email,
      address: parsedAddress,
    }

    if (images.length > 0) {
      updatedData.images = []
      images.map((image: any) => updatedData.images.push(image.filename))
    }

    try {
      const updated = await Company.findByIdAndUpdate(id, updatedData, { new: true })
      setAudit("Company", company._id, company.toObject(), updated?.toObject(), user._id, user.company)
      return res.status(200).json({ message: "Empresa atualizada com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao atualizar empresa!" })
    }
  }
}

const validateInputData = (name: any, cnpj: any, email: any, phone: any): string => {
  if (!name)
    return "O nome é obrigatório!"

  if (!phone)
    return "A telefone é obrigatório!"

  if (!cnpj)
    return "O CNPJ é obrigatório!"

  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  const isValidCnpj = cnpjRegex.test(cnpj);

  if (!isValidCnpj)
    return "O CNPJ está fora do padrão!";

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);

    if (!isValidEmail)
      return "O email está fora do padrão!"
  }

  return ""
}