import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import Topic from '../models/topic';
import mongoose from 'mongoose';

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

export async function injectAdminUser(): Promise<void> {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const roles = ['admin'] 
  let admin = await User.findOne({ username });
  if (admin) {
    admin.password = User.hashPassword(password);
    admin.roles = roles;
    await admin.save();
  } else {
    admin = await new User({ username, password, openid: '-1', roles }).save();
  }
}

const TOPIC_LIST = ['游戏', '生活', '学习', '动漫', '电影'];
export async function injectTopics(): Promise<void> {
  const topics = await Topic.find({
    name: {
      $in: TOPIC_LIST
    }
  });
  const foundedTopics = topics.map(topic => topic.name);

  console.log(foundedTopics)
  await Promise.all(
    TOPIC_LIST.map(async (name) => {
      if (foundedTopics.findIndex((v) => v === name) == -1) {
        const topic = await new Topic({ name }).save();
        console.log('New topic created:', topic);
      }
    })
  );
}
