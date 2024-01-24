"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const get_token_1 = __importDefault(require("./get-token"));
const checkToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Acesso negado!" });
    }
    const token = (0, get_token_1.default)(req);
    if (!token) {
        return res.status(401).json({ message: "Acesso negado!" });
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, 'nossosecret');
        req.user = verified;
        next();
    }
    catch (err) {
        return res.status(400).json({ message: "Token inválido!" });
    }
};
exports.default = checkToken;
