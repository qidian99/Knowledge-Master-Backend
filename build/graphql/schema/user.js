"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_express_1 = require("apollo-server-express");
var typedef = apollo_server_express_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  scalar ObjectScalarType\n  type User {\n    userId: ID!\n    username: String!\n    password: String\n  }\n\n  type LoginResponse {\n    user: User!\n    token: String!\n  }\n\n  input UserInput {\n    email: String!\n    password: String!\n  }\n\n  input SignupInput {\n    username: String\n    email: String!\n    password: String!\n  }\n\n  type Response {\n    message: String!\n    data: ObjectScalarType!\n  }\n\n  extend type Query {\n    users: [User]\n    user(userId: ID!): User!\n    currentUser: User\n    testUser: Response\n  }\n\n  extend type Mutation {\n    signup(input: SignupInput!): LoginResponse!\n    login(input: UserInput!): LoginResponse!\n    deleteAllNonAdmin: Int!\n  }\n"], ["\n  scalar ObjectScalarType\n  type User {\n    userId: ID!\n    username: String!\n    password: String\n  }\n\n  type LoginResponse {\n    user: User!\n    token: String!\n  }\n\n  input UserInput {\n    email: String!\n    password: String!\n  }\n\n  input SignupInput {\n    username: String\n    email: String!\n    password: String!\n  }\n\n  type Response {\n    message: String!\n    data: ObjectScalarType!\n  }\n\n  extend type Query {\n    users: [User]\n    user(userId: ID!): User!\n    currentUser: User\n    testUser: Response\n  }\n\n  extend type Mutation {\n    signup(input: SignupInput!): LoginResponse!\n    login(input: UserInput!): LoginResponse!\n    deleteAllNonAdmin: Int!\n  }\n"])));
exports.default = typedef;
var templateObject_1;
