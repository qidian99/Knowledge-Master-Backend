"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getUser(token) {
    try {
        if (token) {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
        }
        return null;
    }
    catch (err) {
        return null;
    }
}
exports.getUser = getUser;
