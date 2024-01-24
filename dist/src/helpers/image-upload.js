"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let folder = "";
        if (req.baseUrl.includes("users")) {
            folder = "users";
        }
        else if (req.baseUrl.includes("pets")) {
            folder = "pets";
        }
        cb(null, `public/images/${folder}`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + Math.floor(Math.random() * 1000) + path_1.default.extname(file.originalname));
    }
});
const imageUpload = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Somente JPG e PNG são aceitos!'));
        }
        cb(null, true);
    }
});
// declare global {
//   namespace Express {
//     interface Request {
//       files: any;
//       file: any
//     }
//   }
// }
exports.default = imageUpload;
