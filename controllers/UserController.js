const User = require('../models/User')
const bcrypt = require('bcrypt')
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const jwt = require('jsonwebtoken')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" })
      return
    }

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" })
      return
    }

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" })
      return
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" })
      return
    }

    if (!confirmpassword) {
      res.status(422).json({ message: "A confirmação de senha é obrigatória!" })
      return
    }

    if (password !== confirmpassword) {
      res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" })
      return
    }

    const userExists = await User.findOne({ email: email })
    if (userExists) {
      res.status(422).json({ message: "Este email já está sendo utilizado!" })
      return
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({ name, email, phone, password: passwordHash })

    try {
      const newUser = await user.save()
      await createUserToken(newUser, req, res)
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }

  static async login(req, res) {
    const { email, password } = req.body

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" })
      return
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" })
      return
    }

    const user = await User.findOne({ email: email })
    if (!user) {
      res.status(422).json({ message: "Usuário não cadastrado!" })
      return
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
      res.status(422).json({ message: "Senha incorreta!" })
      return
    }

    await createUserToken(user, req, res)
  }

  static async checkUser(req, res) {
    let currentUser

    if (req.headers.authorization) {
      const token = getToken(req)
      const decoded = jwt.verify(token, 'nossosecret')

      currentUser = await User.findById(decoded.id)
      currentUser.password = undefined
    } else {
      currentUser = null
    }

    res.status(200).send(currentUser)
  }

  static async getUserById(req, res) {
    const id = req.params.id

    const user = await User.findById(id).select('-password')

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado!" })
      return
    }

    res.status(200).json({ user })
  }

  static async editUser(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const { name, phone, email, password, confirmpassword } = req.body

    let image = ''

    if (req.file) {
      user.image = req.file.filename
    }

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" })
      return
    }

    user.name = name

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" })
      return
    }

    const userExists = await User.findOne({ email: email })

    if (user.email !== email && userExists) {
      res.status(422).json({ message: "Utilize outro email!" })
      return
    }

    user.email = email

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" })
      return
    }

    user.phone = phone

    if (password !== confirmpassword) {
      res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" })
      return
    } else if (password === confirmpassword && password) {
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      user.password = passwordHash
    }

    try {
      await User.findOneAndUpdate({ _id: user.id }, { $set: user }, { new: true })
      res.status(200).json({ message: "Usuário atualizado com sucesso!" })
    } catch (err) {
      res.status(500).json({ message: err })
      return
    }

    res.status(200).json({ message: "Deu Certo" })
  }
}