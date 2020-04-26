"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-unused-vars
exports.default = (function (error, req, res, next) {
    var status = error.statusCode || 500;
    var message = error.message;
    var data = error.data;
    res.status(status).json({ message: message, data: data });
});
