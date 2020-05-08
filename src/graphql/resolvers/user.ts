require('dotenv').config();
import fetch, { Headers, RequestInit } from 'node-fetch';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User, UserInterface, UserModel } from '../../models/user';
import { ProfileInput } from '../../interfaces/UserDocument';
import { ApolloError } from 'apollo-server-errors';
import Topic from '../../models/topic';
import { checkUserContext, sendTemplateMessage } from '../../util';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});

export default {
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
    users: async (parent: any, args: any, context: any): Promise<any> => {
      // console.log("Test apollo context", context)
      return  User.find({}).populate('subscription')
    },
    user: async (parent: any, args: any, context: any): Promise<any> => {
      const {
        userId
      } = args;
      return  User.findById(userId).populate('subscription')
    },
    currentUser: async (parent: any, args: any, context: any): Promise<any> => {
      const user = checkUserContext(context);
      if (!user) return;
      const temp = await User.findById(user._id).populate('subscription');
      console.log('current user', temp);
      return temp;
    }
  },
  Mutation: {
    deleteAllNonAdmin: async () => {
      const delRes = await User.deleteMany({ roles: { $nin: ['admin'] } });
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

        if (!openid) throw new ApolloError('Invalid code.');
        // try to find the openid first
        let temp = await User.findOne({ openid }).populate('subscription');
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
        const token = jwt.sign({ openid }, process.env.JWT_SECRET || '', {
          expiresIn: 31557600000000
        });

        console.log('Encrypted token:', token);
        console.log('User: ', { ...temp._doc, token });

        // return temp
        return {
          user: temp,
          token
        };
        // return {...temp._doc, token};
      } catch (err) {
        console.log(err);
      }
    },
    updateUserProfile: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      const {
        user: { openid }
      } = context;

      console.log('Updating user profile:', openid, args);

      // try to find the openid first
      const temp = await User.findOne({ openid }).populate('subscription');

      console.log('Updating user profile:', temp, temp?.openid, args);
      if (temp !== null) {
        const keys = Object.keys(args) as (keyof ProfileInput)[];
        keys.forEach((key) => {
          console.log('updating', key);
          (temp[key] as string | number) = args[key];
        });
        await temp.save();
      } else {
        return null;
      }
      return temp;
    },
    setUsername: async (parent: any, args: any, context: any): Promise<any> => {
      console.log('Updating username:', context, args);

      const {
        user: { openid }
      } = context;
      const { username } = args;
      // try to find the openid first
      const temp = await User.findOne({ openid }).populate('subscription');

      console.log('Updating username:', temp);
      if (temp !== null) {
        temp.username = username;
        await temp.save();
      } else {
        return null;
      }
      return temp;
    },
    subscribeToTopic: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      console.log('subscribing to topic:', context, args);

      const {
        user: { openid }
      } = context;
      const { topicId } = args;
      // try to find the openid first
      const temp = await User.findOne({ openid }).populate('subscription');
      if (!temp) {
        console.log('[subscribeToTopic] no user found');
        return null;
      }

      // find topic
      const topic = await Topic.findById(topicId);
      if (!topic) {
        console.log('[subscribeToTopic] no topic found');
        return null;
      }

      if (temp !== null) {
        temp.subscription = topic;
        console.log('subscribed', temp.subscription);
        await temp.save();
      }
      return temp;
    },
    login: async (parent: any, args: any, context: any): Promise<any> => {
      const {
        input: { email, password }
      } = args;
      const user = await User.findOne({
        email
      }).populate('subscription');
      // console.log(user);
      if (user?.comparePassword(password)) {
        const token = jwt.sign(
          { openid: -1, userId: user._id, email },
          process.env.JWT_SECRET || '',
          {
            expiresIn: 31557600000000
          }
        );
        return {
          token,
          user
        };
      }
      return null;
    },
    sendTemplate: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const user = checkUserContext(context);
        await sendTemplateMessage(user.openid);
        // await sendTemplateMessage('otVZc5QIASQCvzmje10-fn2EBC50');
        return true;
      } catch (err) {
        return false;
      }
    },
    addToGallery: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const user = checkUserContext(context);
        const temp = await User.findById(user._id);
        const { filepath } = args;
        if (!temp) return null;
        if (!temp.gallery) {
          temp.gallery = [filepath];
        } else {
          temp.gallery.push(filepath);
        }
        await temp.save();
        return temp.gallery;
      } catch (err) {
        return false;
      }
    },
    setUserGallery: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const user = checkUserContext(context);
        const temp = await User.findById(user._id);
        const { files } = args;
        if (!temp) return null;
        temp.gallery = files;
        await temp.save();
        return temp.gallery;
      } catch (err) {
        return false;
      }
    },
    deleteFromGallery: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const user = checkUserContext(context);
        const temp = await User.findById(user._id);
        const { filepath } = args;
        if (!temp) return null;
        if (!temp.gallery) {
          temp.gallery = [];
        } else {
          const index = temp.gallery.findIndex((fp) => fp === filepath);
          if (index !== -1) {
            temp.gallery.splice(index, 1);
          }
        }
        await temp.save();
        return temp.gallery;
      } catch (err) {
        return false;
      }
    },
    deleteGallery: async (
      parent: any,
      args: any,
      context: any
    ): Promise<any> => {
      try {
        const user = checkUserContext(context);
        const temp = await User.findById(user._id);
        if (!temp) return null;
        temp.gallery = [];
        await temp.save();
        return temp.gallery;
      } catch (err) {
        return false;
      }
    }
  }
};
