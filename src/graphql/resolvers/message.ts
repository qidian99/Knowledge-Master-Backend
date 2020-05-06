import { ApolloError } from 'apollo-server-errors';
import { withFilter } from 'graphql-subscriptions';
const _ = require("lodash");
import { Types } from 'mongoose'
const { getUserModel } = require('../../util');
import errMsg from '../util/errorMessage';
import Room from '../../models/room';
import Message from '../../models/message';
import { checkUserContext } from '../../util';
import pubsub from '../../util/pubsub';

const CHAT_CHANNEL = "chat_channel";

export default {
  Message: {
    messageId: async (parent: any, args: any, context: any): Promise<any> => parent._id,
    sender: async (parent: any, args: any, context: any): Promise<any> => {
      return await getUserModel(parent.senderId).findById(parent.senderId);
    },
    receiver: async (parent: any, args: any, context: any): Promise<any> => {
      return await getUserModel(parent.receiverId).findById(parent.receiverId);
    },
    // Let front end processes it
    // createdAt: (parent) => {
    //   return moment(parent.createdAt)
    //     .tz("America/Los_Angeles")
    //     .format("YYYY-MM-DD HH:mm:ss");
    // },
    room: async (parent: any, args: any, context: any): Promise<any> => {
      return await Room.findById(parent.roomId);
    },
  },
  Mutation: {
    deleteAllMessages : async (parent: any, args: any, context: any): Promise<any> => {
      const delRes = await Message.deleteMany({});
      const delRes2 = await Room.deleteMany({});
      console.log("Messages deleted", delRes, "Rooms deleted", delRes2)
      return delRes.deletedCount as Number;
    },
    newMessage: async (parent: any, args: any, context: any): Promise<any> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR)
      };

      const senderId = Types.ObjectId(user._id);

      const { receiverId, content } = args;
      let room = await Room.findOne({
        chatterIds: { $all: [senderId, receiverId] },
      });
      if (!room) {
        room = await new Room({
          chatterIds: [senderId, receiverId],
        }).save();
        if (!room) {
          throw new ApolloError(...errMsg.ROOM_CREATION_ERR);
        }
      }
      //const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
      const newMsg = await new Message({
        roomId: room._id,
        senderId,
        receiverId,
        content,
      }).save();

      if (!newMsg) {
        throw new ApolloError(...errMsg.MSG_CREATION_ERR);
      }
      pubsub.publish(CHAT_CHANNEL, { newMessage: newMsg });
      return newMsg;
    },
  },
  Query: {
    messages: async (parent: any, args: any, context: any): Promise<any> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR)
      };
      const { chatterId } = args;
      const messages = await Message.find({
        $or: [
          { receiverId: chatterId, senderId: user._id },
          { senderId: chatterId, receiverId: user._id },
        ],
      }).sort({ createdAt: -1 });
      return messages;
    },
    messageList:  async (parent: any, args: any, context: any): Promise<any> => {
      const user = checkUserContext(context);
      if (!user) {
        throw new ApolloError(...errMsg.USER_CONTEXT_ERR)
      };
      const rooms = await Room.find({ chatterIds: { $all: [user._id] } })
      console.log('Found rooms', rooms)
      const msgList = await rooms.reduce(async (res: any, curr: any, index, arr) => {
        const msg = (
          await Message.find({ roomId: curr._id }).sort({ createdAt: -1 })
        )[0];
        if (msg) {
          if (msg.senderId.equals(user._id)) {
            (await res).push({
              _id: curr._id,
              chatterIds: [msg.senderId, msg.receiverId],
              messageId: msg._id,
              createdAt: msg.createdAt,
            });
          } else if (msg.receiverId.equals(user._id)) {
            (await res).push({
              _id: curr._id,
              chatterIds: [msg.receiverId, msg.senderId],
              messageId: msg._id,
              createdAt: msg.createdAt,
            });
          }
        }
        return res;
      }, []);
      console.log("Message list", msgList)
      return _.orderBy(msgList, ["createdAt"], ["desc"]);
    },
  },
  Subscription: {
    newMessage: {
      resolve: (payload: any) => {
        return payload.newMessage;
      },
      subscribe: withFilter(
        (root, args, context, info) => {
          console.log("User subscribing to new messages:", context)
          return pubsub.asyncIterator(CHAT_CHANNEL)
        },
        (payload, args, context) => {
          console.log(context, payload.newMessage);
          return payload.newMessage.receiverId.equals(context.user._id);
        }
      ),
    },
  },
  UserType: {
    __resolveType(obj: any, context: any, info: any) {
      return "User";
    },
  },
};
