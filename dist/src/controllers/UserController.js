"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const create_user_token_1 = __importDefault(require("../helpers/create-user-token"));
const get_token_1 = __importDefault(require("../helpers/get-token"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const get_user_by_token_1 = __importDefault(require("../helpers/get-user-by-token"));
class UserController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone, password, confirmpassword } = req.body;
            if (!name) {
                res.status(422).json({ message: "O nome é obrigatório!" });
                return;
            }
            if (!email) {
                res.status(422).json({ message: "O email é obrigatório!" });
                return;
            }
            if (!phone) {
                res.status(422).json({ message: "O telefone é obrigatório!" });
                return;
            }
            if (!password) {
                res.status(422).json({ message: "A senha é obrigatória!" });
                return;
            }
            if (!confirmpassword) {
                res.status(422).json({ message: "A confirmação de senha é obrigatória!" });
                return;
            }
            if (password !== confirmpassword) {
                res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" });
                return;
            }
            const userExists = yield User_1.default.findOne({ email: email });
            if (userExists) {
                res.status(422).json({ message: "Este email já está sendo utilizado!" });
                return;
            }
            const salt = yield bcrypt_1.default.genSalt(12);
            const passwordHash = yield bcrypt_1.default.hash(password, salt);
            const user = new User_1.default({ name, email, phone, password: passwordHash });
            try {
                const newUser = yield user.save();
                yield (0, create_user_token_1.default)(newUser, req, res);
            }
            catch (err) {
                res.status(500).json({ message: err });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email) {
                res.status(422).json({ message: "O email é obrigatório!" });
                return;
            }
            if (!password) {
                res.status(422).json({ message: "A senha é obrigatória!" });
                return;
            }
            const user = yield User_1.default.findOne({ email: email });
            if (!user) {
                res.status(422).json({ message: "Usuário não cadastrado!" });
                return;
            }
            const checkPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!checkPassword) {
                res.status(422).json({ message: "Senha incorreta!" });
                return;
            }
            yield (0, create_user_token_1.default)(user, req, res);
        });
    }
    static checkUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentUser;
            if (req.headers.authorization) {
                const token = (0, get_token_1.default)(req);
                const decoded = jsonwebtoken_1.default.verify(token !== null && token !== void 0 ? token : "", 'nossosecret');
                currentUser = yield User_1.default.findById(decoded.id);
                currentUser.password = undefined;
            }
            else {
                currentUser = null;
            }
            res.status(200).send(currentUser);
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const user = yield User_1.default.findById(id).select('-password');
            if (!user) {
                res.status(422).json({ message: "Usuário não encontrado!" });
                return;
            }
            res.status(200).json({ user });
        });
    }
    static editUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            const { name, phone, email, password, confirmpassword } = req.body;
            let image = '';
            if (req.file) {
                user.image = req.file.filename;
            }
            if (!name) {
                res.status(422).json({ message: "O nome é obrigatório!" });
                return;
            }
            user.name = name;
            if (!email) {
                res.status(422).json({ message: "O email é obrigatório!" });
                return;
            }
            const userExists = yield User_1.default.findOne({ email: email });
            if (user.email !== email && userExists) {
                res.status(422).json({ message: "Utilize outro email!" });
                return;
            }
            user.email = email;
            if (!phone) {
                res.status(422).json({ message: "O telefone é obrigatório!" });
                return;
            }
            user.phone = phone;
            if (password !== confirmpassword) {
                res.status(422).json({ message: "A senha e a confirmação de senha precisam ser iguais!" });
                return;
            }
            else if (password === confirmpassword && password) {
                const salt = yield bcrypt_1.default.genSalt(12);
                const passwordHash = yield bcrypt_1.default.hash(password, salt);
                user.password = passwordHash;
            }
            try {
                yield User_1.default.findOneAndUpdate({ _id: user.id }, { $set: user }, { new: true });
                res.status(200).json({ message: "Usuário atualizado com sucesso!" });
            }
            catch (err) {
                res.status(500).json({ message: err });
                return;
            }
            res.status(200).json({ message: "Deu Certo" });
        });
    }
}
exports.default = UserController;
