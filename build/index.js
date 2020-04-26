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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
require('dotenv').config();
var express_1 = __importStar(require("express"));
var mongoose_1 = require("mongoose");
var apollo_server_express_1 = require("apollo-server-express");
var apollo_server_errors_1 = require("apollo-server-errors");
var connect_busboy_1 = __importDefault(require("connect-busboy")); // middleware for form/file upload
var path_1 = require("path"); // used for file path
var fs_extra_1 = require("fs-extra"); // File System - for file manipulation
require("./models"); // require before resolvers to register the schemas
var schema_1 = __importDefault(require("./graphql/schema"));
var resolvers_1 = __importDefault(require("./graphql/resolvers"));
var cors_1 = __importDefault(require("./middlewares/cors"));
var errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
var util_1 = require("./util");
var url = process.env.MONGO_DEV_URL || 'localhost:4002';
var User = mongoose_1.model('User');
var app = express_1.default();
app.use(connect_busboy_1.default());
// app.use(express.static(join(__dirname, 'public')));
console.log(path_1.join(__dirname + 'public'));
app.use(express_1.urlencoded({
    extended: true
}));
app.use(express_1.json());
app.use(cors_1.default);
app.use(errorHandler_1.default);
app.route('/upload').post(function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        // Path where image will be uploaded
        fstream = fs_extra_1.createWriteStream(__dirname + "/files/" + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Upload Finished of " + filename);
            // TODO: enable this line when wired up with FE!
            // res.redirect('back');           //where to go next
        });
    });
});
var server = new apollo_server_express_1.ApolloServer({
    typeDefs: schema_1.default,
    resolvers: resolvers_1.default,
    context: function (_a) {
        var req = _a.req;
        return __awaiter(void 0, void 0, void 0, function () {
            var tokenWithBearer, token, u, roles, userObject;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenWithBearer = req.headers.authorization || '';
                        token = tokenWithBearer.split(' ')[1];
                        u = util_1.getUser(token);
                        roles = [];
                        if (!(u && u.email)) return [3 /*break*/, 2];
                        return [4 /*yield*/, User.findOne({
                                email: u.email
                            })];
                    case 1:
                        userObject = _b.sent();
                        if (userObject) {
                            return [2 /*return*/, {
                                    user: {
                                        email: userObject.email,
                                        id: userObject.id,
                                        roles: userObject.roles
                                    }
                                }];
                        }
                        return [2 /*return*/, {}];
                    case 2: return [2 /*return*/, {}];
                }
            });
        });
    },
    formatError: function (err) {
        console.log(err);
        return new Error(err.message);
    },
    plugins: [
        {
            requestDidStart: function () {
                // console.log('request started!');
                return {
                    didEncounterErrors: function (context) {
                        // console.log(context)
                        var response = context.response, errors = context.errors;
                        var msg;
                        if (errors.find(function (err) {
                            var unauthorized = err.originalError instanceof apollo_server_errors_1.AuthenticationError;
                            if (unauthorized)
                                msg = err.message;
                            return unauthorized;
                        })) {
                            // response.data = undefined
                            // console.log('status', response.http)
                            if (response && response.http) {
                                response.http.status = 401;
                            }
                            throw new Error(msg);
                            // response.http.headers.set('Has-Errors', '1');
                            // console.log(response, errors)
                        }
                        else {
                            throw new Error('Unknown error');
                        }
                    },
                    willSendResponse: function (context) {
                        // console.log('will send response', context);
                    }
                };
            },
            serverWillStart: function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log('Server starting!');
                        return [2 /*return*/];
                    });
                });
            }
        }
    ]
});
server.applyMiddleware({
    app: app
});
var port = process.env.PORT || 4002;
app.listen({
    port: port
}, function () {
    return console.log("\uD83D\uDE80 Server ready at http://localhost:" + port + server.graphqlPath);
});
mongoose_1.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(function (err) { return console.log(err); });
