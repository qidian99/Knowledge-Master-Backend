require('dotenv').config();
import fetch, { Headers, RequestInit } from 'node-fetch';
import { ObjectScalarType } from '../schema/ObjectScalarType';
import Topic from '../../models/topic';
import { ProfileInput } from '../../interfaces/UserDocument';
import { ApolloError } from 'apollo-server-errors';

export default {
  Topic: {
    topicId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    topics: async (parent: any, args: any, context: any): Promise<any> => {
      return Topic.find({});
    }
  },
  Mutation: {
    deleteAllTopics: async () => (await Topic.deleteMany({})).deletedCount
  },
};
