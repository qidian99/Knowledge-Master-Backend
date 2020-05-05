import { ApolloError } from 'apollo-server-errors';
const { getUserModel } = require('../../util');
import errMsg from '../util/errorMessage';
import Room from '../../models/room';
import Message from '../../models/message';

export default {
	Room: {
		roomId: (parent: any, args: any, context: any): any => parent._id,
		chatterOne: async (parent: any, args: any, context: any): Promise<any> => {
			const user = await getUserModel(parent.chatterIds[0]).findById(parent.chatterIds[0]);
			if(!user){
				throw new ApolloError(...errMsg.CHATTER_ONE_RESOLVE_ERR);
			}
			return user;
		},
		chatterTwo:  async (parent: any, args: any, context: any): Promise<any> => {
			const user =  await getUserModel(parent.chatterIds[1]).findById(parent.chatterIds[1]);
			if(!user){
				throw new ApolloError(...errMsg.CHATTER_TWO_RESOLVE_ERR);
			}
			return user;
		},
		message: async (parent: any, args: any, context: any): Promise<any> => {
			const msg = await Message.findById(parent.messageId);
			return msg;
		}
	},
}