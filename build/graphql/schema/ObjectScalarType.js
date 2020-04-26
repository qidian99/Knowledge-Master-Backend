"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var language_1 = require("graphql/language");
exports.ObjectScalarType = new graphql_1.GraphQLScalarType({
    name: 'Object',
    description: 'Arbitrary object',
    parseValue: function (value) {
        return typeof value === 'object'
            ? value
            : typeof value === 'string'
                ? JSON.parse(value)
                : null;
    },
    serialize: function (value) {
        return typeof value === 'object'
            ? value
            : typeof value === 'string'
                ? JSON.parse(value)
                : null;
    },
    parseLiteral: function (ast) {
        switch (ast.kind) {
            case language_1.Kind.STRING:
                return JSON.parse(ast.value);
            case language_1.Kind.OBJECT:
                throw new Error("Not sure what to do with OBJECT for ObjectScalarType");
            default:
                return null;
        }
    }
});
