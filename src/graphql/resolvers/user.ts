require('dotenv').config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { ObjectScalarType } from '../schema/ObjectScalarType';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});

const User = mongoose.model('User');

export default {
  ObjectScalarType,
  User: {
    userId: async (parent: any): Promise<any> => parent._id
  },
  Query: {
    testUser: async (parent: any, args: any, context: any): Promise<any> => {
      return {
        data: {
          user: 'Test User'
        },
        message: 'Test GraphQL API for Wechat MP'
      };
    }
  }
};
