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
const get_token_1 = __importDefault(require("../helpers/get-token"));
const get_user_by_token_1 = __importDefault(require("../helpers/get-user-by-token"));
const Pet_1 = __importDefault(require("../models/Pet"));
const mongoose_1 = require("mongoose");
class UserController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, age, weight, color } = req.body;
            const images = req.files;
            const available = true;
            if (!name) {
                res.status(422).json({ message: "O nome é obrigatório!" });
                return;
            }
            if (!age) {
                res.status(422).json({ message: "A idade é obrigatório!" });
                return;
            }
            if (!weight) {
                res.status(422).json({ message: "O peso é obrigatório!" });
                return;
            }
            if (!color) {
                res.status(422).json({ message: "A cor é obrigatória!" });
                return;
            }
            if (images.length === 0) {
                res.status(422).json({ message: "A imagem é obrigatória!" });
                return;
            }
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            const pet = new Pet_1.default({
                name,
                age,
                weight,
                color,
                available,
                user: {
                    _id: user._id,
                    name: user.name,
                    image: user.image,
                    phone: user.phone
                }
            });
            images.map((image) => pet.images.push(image.filename));
            try {
                const newPet = yield pet.save();
                res.status(201).json({ message: "Pet cadastrado com sucesso!", newPet });
            }
            catch (err) {
                res.status(500).json({ message: err });
            }
        });
    }
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const pets = yield Pet_1.default.find().sort('-createAt');
            res.status(200).json({ pets: pets });
        });
    }
    static getAllUserPets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            const pets = yield Pet_1.default.find({ 'user._id': user._id }).sort('-createAt');
            res.status(200).json({ pets: pets });
        });
    }
    static getAllUserAdoptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            const pets = yield Pet_1.default.find({ 'adopter._id': user._id }).sort('-createAt');
            res.status(200).json({ pets: pets });
        });
    }
    static getPetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(422).json({ message: "Id inválido!" });
                return;
            }
            const pet = yield Pet_1.default.findOne({ _id: id });
            if (!pet) {
                res.status(404).json({ message: "Pet não encontrado!" });
                return;
            }
            res.status(200).json({ pet: pet });
        });
    }
    static removePetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(422).json({ message: "Id inválido!" });
                return;
            }
            const pet = yield Pet_1.default.findOne({ _id: id });
            if (!pet) {
                res.status(404).json({ message: "Pet não encontrado!" });
                return;
            }
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            if (user._id.toString() !== pet.user._id.toString()) {
                res.status(422).json({ message: "Houve um problema no processamento da exclusão!" });
                return;
            }
            yield Pet_1.default.findByIdAndRemove(id);
            res.status(200).json({ message: "Pet removido com sucesso!" });
        });
    }
    static updatePet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { name, age, weight, color, available } = req.body;
            const images = req.files;
            const updatedData = {};
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(422).json({ message: "Id inválido!" });
                return;
            }
            const pet = yield Pet_1.default.findOne({ _id: id });
            if (!pet) {
                res.status(404).json({ message: "Pet não encontrado!" });
                return;
            }
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            if (user._id.toString() !== pet.user._id.toString()) {
                res.status(422).json({ message: "Houve um problema no processamento da edição!" });
                return;
            }
            if (!name) {
                res.status(422).json({ message: "O nome é obrigatório!" });
                return;
            }
            else {
                updatedData.name = name;
            }
            if (!age) {
                res.status(422).json({ message: "A idade é obrigatório!" });
                return;
            }
            else {
                updatedData.age = age;
            }
            if (!weight) {
                res.status(422).json({ message: "O peso é obrigatório!" });
                return;
            }
            else {
                updatedData.weight = weight;
            }
            if (!color) {
                res.status(422).json({ message: "A cor é obrigatória!" });
                return;
            }
            else {
                updatedData.color = color;
            }
            if (images.length > 0) {
                updatedData.images = [];
                images.map((image) => updatedData.images.push(image.filename));
            }
            yield Pet_1.default.findByIdAndUpdate(id, updatedData);
            res.status(200).json({ message: "Pet atualizado com sucesso!" });
        });
    }
    static schedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(422).json({ message: "Id inválido!" });
                return;
            }
            const pet = yield Pet_1.default.findOne({ _id: id });
            if (!pet) {
                res.status(404).json({ message: "Pet não encontrado!" });
                return;
            }
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            if (pet.user._id.equals(user._id)) {
                res.status(422).json({ message: "Você não pode agendar uma visita com seu próprio Pet!" });
                return;
            }
            if (pet.adopter) {
                if (pet.adopter._id.equals(user._id)) {
                    res.status(422).json({ message: "Você já agendou uma visita para esse Pet!" });
                    return;
                }
            }
            pet.adopter = {
                _id: user._id,
                name: user.name,
                image: user.image
            };
            yield Pet_1.default.findByIdAndUpdate(id, pet);
            res.status(200).json({ message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}` });
        });
    }
    static concludeAdoption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(422).json({ message: "Id inválido!" });
                return;
            }
            const pet = yield Pet_1.default.findOne({ _id: id });
            if (!pet) {
                res.status(404).json({ message: "Pet não encontrado!" });
                return;
            }
            const token = (0, get_token_1.default)(req);
            const user = yield (0, get_user_by_token_1.default)(token, res);
            if (user._id.toString() !== pet.user._id.toString()) {
                res.status(422).json({ message: "Houve um problema no processamento de conclusão!" });
                return;
            }
            pet.available = false;
            yield Pet_1.default.findByIdAndUpdate(id, pet);
            res.status(200).json({ message: "Parabéns, o ciclo de adoção foi finalizado com sucesso!" });
        });
    }
}
exports.default = UserController;
