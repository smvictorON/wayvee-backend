import User from '../models/User'
import bcrypt from 'bcrypt'
import createUserToken from '../helpers/create-user-token'
import getToken from '../helpers/get-token'
import jwt, { JwtPayload } from 'jsonwebtoken';
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';
import { setAudit } from "../helpers/set-audit";
import { isValidObjectId } from "mongoose";

export default class UserController {
  static async create(req: Request, res: Response) {
    const { name, email, phone, password, confirmpassword, company } = req.body

    const err = await validateInputData(name, email, phone, password, confirmpassword, company)
    if (err != "")
      return res.status(422).json({ message: err });

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, phone, password: passwordHash, company })

    try {
      const newUser = await user.save()
      return res.status(201).json({ message: "Usuário cadastrado com sucesso!", newUser })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err })
    }
  }

  static async register(req: Request, res: Response) {
    const { name, email, phone, password, confirmpassword, company } = req.body

    const err = await validateInputData(name, email, phone, password, confirmpassword, company)
    if (err != "")
      return res.status(422).json({ message: err });

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, phone, password: passwordHash, company })

    try {
      const newUser = await user.save()
      await createUserToken(newUser, req, res)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: err })
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email)
      return res.status(422).json({ message: "O email é obrigatório!" })

    if (!password)
      return res.status(422).json({ message: "A senha é obrigatória!" })

    const user = await User.findOne({ email: email }).populate('company')
    if (!user)
      return res.status(422).json({ message: "Usuário não cadastrado!" })

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword)
      return res.status(422).json({ message: "Senha incorreta!" })

    return await createUserToken(user, req, res)
  }

  static async checkUser(req: Request, res: Response) {
    let currentUser: any

    if (req.headers.authorization) {
      const token = getToken(req)
      const decoded = jwt.verify(token ?? "", 'wayveesecret') as JwtPayload;

      currentUser = await User.findById(decoded.id)
      currentUser.password = undefined
    } else {
      currentUser = null
    }

    return res.status(200).send(currentUser)
  }

  static async getUserById(req: Request, res: Response) {
    const id = req.params.id

    const user = await User.findById(id).select('-password')
    if (!user)
      return res.status(422).json({ message: "Usuário não encontrado!" })

    return res.status(200).json({ user })
  }

  static async editUser(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)
    const { name, phone, email, password, confirmpassword } = req.body

    if (req.file)
      user.image = req.file.filename

    if (!name)
      return res.status(422).json({ message: "O nome é obrigatório!" })

    user.name = name

    if (!email)
      return res.status(422).json({ message: "O email é obrigatório!" })

    const userExists = await User.findOne({ email: email })

    if (user.email !== email && userExists)
      return res.status(422).json({ message: "Utilize outro email!" })

    user.email = email

    if (!phone)
      return res.status(422).json({ message: "O telefone é obrigatório!" })

    user.phone = phone

    if (password !== confirmpassword) {
      return res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" })
    } else if (password === confirmpassword && password) {
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)
      user.password = passwordHash
    }

    try {
      const updated = await User.findOneAndUpdate({ _id: user.id }, { $set: user }, { new: true })
      setAudit("User", userExists?._id, userExists?.toObject(), updated?.toObject(), user._id, user.company)
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" })
    } catch (err) {
      return res.status(500).json({ message: err })
    }
  }

  static async getAll(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if(!user.isSuper)
      return res.status(422).json({ message: "Requisição inválida!" });

    const users = await User.find({ "deletedAt": { "$exists": false } }).sort("-name")

    return res.status(200).json({ users: users })
  }

  static async updateOne(req: Request, res: Response) {
    const token = getToken(req)
    const user = await getUserByToken(token, res)
    const { name, phone, email, password, confirmpassword, company } = req.body
    const userId = req.params.id

    if (!name)
      return res.status(422).json({ message: "O nome é obrigatório!" })

    if (!email)
      return res.status(422).json({ message: "O email é obrigatório!" })

    const userExists = await User.findOne({ email: email })

    if (userExists?.email === email && userExists?._id.toString() !== userId)
      return res.status(422).json({ message: "Utilize outro email!" })

    if (!company)
      return res.status(422).json({ message: "O empresa é obrigatória!" })

    if (!phone)
      return res.status(422).json({ message: "O telefone é obrigatório!" })

    if (!user.isSuper)
    return res.status(422).json({ message: "Houve um problema no processamento!" })

    const userToBeUpdated:any = {
      name: name,
      email: email,
      phone: phone,
    }

    if (password !== confirmpassword) {
      return res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" })
    } else if (password === confirmpassword && password) {
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)
      userToBeUpdated.password = passwordHash
    }

    try {
      const updated = await User.findOneAndUpdate({ _id: userExists?._id }, { $set: userToBeUpdated }, { new: true })
      setAudit("User", userExists?._id, userExists?.toObject(), updated?.toObject(), user._id, user.company)
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" })
    } catch (err) {
      return res.status(500).json({ message: err })
    }
  }

  static async deleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const userExists = await User.findOne({ _id: id })
    if (!userExists)
      return res.status(404).json({ message: "Usuário não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (!user.isSuper)
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    try {
      await User.findByIdAndRemove(id)
      return res.status(200).json({ message: "Usuário removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover usuário!" })
    }
  }

  static async softDeleteOne(req: Request, res: Response) {
    const id = req.params.id

    if (!isValidObjectId(id))
      return res.status(422).json({ message: "Id inválido!" })

    const userExists = await User.findOne({ _id: id })
    if (!userExists)
      return res.status(404).json({ message: "Usuário não encontrado!" })

    const token = getToken(req)
    const user = await getUserByToken(token, res)

    if (!user.isSuper)
      return res.status(422).json({ message: "Houve um problema no processamento da exclusão!" })

    userExists.deletedAt = new Date()
    try {
      await User.findByIdAndUpdate(id, userExists)
      return res.status(200).json({ message: "Usuário removido com sucesso!" })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "Ocorreu um problema ao remover usuário!" })
    }
  }
}

const validateInputData = async (name: any, email: any, phone: any, password: any, confirmpassword: any, company: any): Promise<string> => {
  if (!name)
    return "O nome é obrigatório!"

  if (!email)
    return "O email é obrigatório!"

  if (!phone)
    return "O telefone é obrigatório!"

  if (!password)
    return "A senha é obrigatória!"

  if (!confirmpassword)
    return "A confirmação de senha é obrigatória!"

  if (password !== confirmpassword)
    return "A senha e a confirmação de senha precisam ser iguais!"

  if (!company)
    return "A empresa é obrigatória!"

  const userExists = await User.findOne({ email: email })
  if (userExists)
    return "Este email já está sendo utilizado!"

  return ""
}