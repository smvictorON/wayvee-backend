import User from '../models/User'
import bcrypt from 'bcrypt'
import createUserToken from '../helpers/create-user-token'
import getToken from '../helpers/get-token'
import jwt, { JwtPayload } from 'jsonwebtoken';
import getUserByToken from '../helpers/get-user-by-token'
import { Request, Response } from 'express';

export default class UserController {
  static async register(req: Request, res: Response) {
    const { name, email, phone, password, confirmpassword } = req.body

    if (!name)
      return res.status(422).json({ message: "O nome é obrigatório!" })

    if (!email)
      return res.status(422).json({ message: "O email é obrigatório!" })

    if (!phone)
      return res.status(422).json({ message: "O telefone é obrigatório!" })

    if (!password)
      return res.status(422).json({ message: "A senha é obrigatória!" })

    if (!confirmpassword)
      return res.status(422).json({ message: "A confirmação de senha é obrigatória!" })

    if (password !== confirmpassword)
      return res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" })

    const userExists = await User.findOne({ email: email })
    if (userExists)
      return res.status(422).json({ message: "Este email já está sendo utilizado!" })

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, phone, password: passwordHash })

    try {
      const newUser = await user.save()
      await createUserToken(newUser, req, res)
    } catch (err) {
      return res.status(500).json({ message: err })
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email)
      return res.status(422).json({ message: "O email é obrigatório!" })

    if (!password)
      return res.status(422).json({ message: "A senha é obrigatória!" })

    const user = await User.findOne({ email: email })
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
      const decoded = jwt.verify(token ?? "", 'nossosecret') as JwtPayload;

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
      await User.findOneAndUpdate({ _id: user.id }, { $set: user }, { new: true })
      return res.status(200).json({ message: "Usuário atualizado com sucesso!" })
    } catch (err) {
      return res.status(500).json({ message: err })
    }
  }
}