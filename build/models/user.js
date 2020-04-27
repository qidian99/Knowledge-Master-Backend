"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var bcrypt = __importStar(require("bcryptjs"));
var userSchema = new Schema({
    email: { type: String, required: false },
    password: { type: String, required: false },
    username: { type: String, required: false },
    roles: [{ type: String, required: false }],
    sessionKey: { type: String, required: false },
    openid: { type: String, required: true }
});
userSchema.method('comparePassword', function (password) {
    if (bcrypt.compareSync(password, this.password))
        return true;
    return false;
});
userSchema.static('hashPassword', function (password) {
    return bcrypt.hashSync(password);
});
exports.User = mongoose_1.model('User', userSchema);
exports.default = mongoose_1.model('User', userSchema);
