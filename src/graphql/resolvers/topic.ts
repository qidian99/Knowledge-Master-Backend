require('dotenv').config();
import fetch, { Headers, RequestInit } from 'node-fetch';
import { ObjectScalarType } from '../util/ObjectScalarType';
import Topic from '../../models/topic';
import { ProfileInput } from '../../interfaces/UserDocument';
import { ApolloError } from 'apollo-server-errors';

export default {
  Topic: {
    topicId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    topics: async (parent: any, args: any, context: any): Promise<any> => {
      return Topic.find({}, null, {
        sort: { updatedAt: -1 }
      });
    }
  },
  Mutation: {
    deleteAllTopics: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => (await Topic.deleteMany({})).deletedCount
  }
};
