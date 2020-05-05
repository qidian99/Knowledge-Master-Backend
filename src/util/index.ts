import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Post } from '../models/post';
import Topic from '../models/topic';
import mongoose, { Types } from 'mongoose';
import { ApolloError } from 'apollo-server-errors';
import wechatManager from '../wechat';

export function getUser(token: string): any {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET || '');
    }
    return null;
  } catch (err) {
    return null;
  }
}

export const getUserModel = (id: Types.ObjectId) => {
  return User;
}

export async function injectAdminUser(): Promise<void> {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return;
  const email = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const roles = ['admin'];
  let admin = await User.findOne({ email });
  if (admin) {
    admin.password = User.hashPassword(password);
    admin.roles = roles;
    admin.username = '管理员';
    await admin.save();
  } else {
    admin = await new User({
      email,
      username: '管理员',
      password: User.hashPassword(password),
      openid: '-1',
      roles
    }).save();
  }

  // inject the post
  const title = '新功能建议';
  const body = '大家开一开脑洞，有什么好的想法可以分享下～';
  const topic = await Topic.findOne({
    name: '新功能'
  });
  const temp = await Post.findOne({
    title,
    body,
    user: admin,
    topic
  });
  console.log('finding new feature post', temp);
  if (temp) {
    await temp.save(); // up up
  } else {
    const post = new Post({
      title,
      body,
      topic,
      user: admin,
      block: 'default',
      hide: false,
      likes: [],
      comments: []
    }).save();
  }
}

const TOPIC_LIST = ['游戏', '动漫', '电影', '学习', '生活', '新功能'];
export async function injectTopics(): Promise<void> {
  const topics = await Topic.find({
    name: {
      $in: TOPIC_LIST
    }
  });
  const foundedTopics = topics.map((topic) => topic.name);

  console.log(foundedTopics);
  await Promise.all(
    TOPIC_LIST.map(async (name) => {
      if (foundedTopics.findIndex((v) => v === name) == -1) {
        const topic = await new Topic({ name }).save();
        console.log('New topic created:', topic);
      }
    })
  );
}

export function checkUserContext(context: any): any {
  const { user } = context;
  if (!user) {
    console.log('You are not authorized to create a post');
    throw new ApolloError('You are not authorized to create a post', '401');
  }
  return user;
}

export async function sendTemplateMessage(openid: string): Promise<any> {
  await wechatManager.sendTemplate(openid);
  return true;
}
