require('dotenv').config();
import fetch, { Headers, RequestInit } from 'node-fetch';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { ObjectScalarType } from '../schema/ObjectScalarType';
import { User, UserInterface, UserModel } from '../../models/user';
import { ProfileInput } from '../../interfaces/UserDocument';
import { ApolloError } from 'apollo-server-errors';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});

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
    },
    users: async (parent: any, args: any, context: any): Promise<any> =>
      User.find({})
  },
  Mutation: {
    deleteAllNonAdmin: async () => {
      const delRes = await User.deleteMany({ "roles": { "$nin": ['admin'] }})
      return delRes.deletedCount;
    },
    registerOpenid: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const { code } = args;

        const myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');

        const requestOptions: RequestInit = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        const appid = process.env.APP_ID;
        const appSecret = process.env.APP_SECRET;

        if (!appid || !appSecret || !code)
          throw new ApolloError('Invalid register code input', '422');

        const res = await fetch(
          `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`,
          requestOptions
        );

        const data = await res.json();

        console.log('WXAPI returns:', data);

        const { session_key: sessionKey, openid } = data;

        if (!openid) throw new ApolloError("Invalid code.")
        // try to find the openid first
        let temp = await User.findOne({ openid });
        if (temp) {
          temp.sessionKey = sessionKey;
          await temp.save();
        } else {
          temp = await new User({
            openid,
            sessionKey
          }).save();
        }

        // encrpyt openid using bcrypt
        const token = jwt.sign({ openid }, process.env.JWT_SECRET || '', { expiresIn: 31557600000000 });

        console.log('Encrypted token:', token);
        console.log('User: ',  {...temp._doc, token});
        
        // return temp
        return {
          user: temp,
          token
        }
        // return {...temp._doc, token};
      } catch (err) {
        console.log(err)
      }
    },
    updateUserProfile: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      const { openid, profile } = args;
      // try to find the openid first
      const temp = await User.findOne({ openid });
      if (temp !== null) {
        const keys = Object.keys(profile) as (keyof ProfileInput)[];
        keys.forEach((key) => {
          (temp[key] as string | number) = profile[key];
        });
        await temp.save();
      } else {
        return null;
      }
      return temp;
    }
  }
};
