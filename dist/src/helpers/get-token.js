"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getToken = (req) => {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    return token;
};
exports.default = getToken;
