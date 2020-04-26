import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const ObjectScalarType = new GraphQLScalarType({
  name: 'Object',
  description: 'Arbitrary object',
  parseValue: (value: any): any => {
    return typeof value === 'object'
      ? value
      : typeof value === 'string'
      ? JSON.parse(value)
      : null;
  },
  serialize: (value: any): any => {
    return typeof value === 'object'
      ? value
      : typeof value === 'string'
      ? JSON.parse(value)
      : null;
  },
  parseLiteral: (ast: any): any => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`);
      default:
        return null;
    }
  }
});
