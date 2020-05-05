const { gql } = require('apollo-server-express');

const typedef = gql`
	type Message {
		messageId: ID!
		sender: UserType!
		receiver: UserType!
		content: String!
		createdAt: String!
		room: Room!
	}

	union UserType = User

	extend type Mutation {
		newMessage(
			receiverId: ID!
			content: String!
		):Message!
	}

	extend type Query {
		messages(
			chatterId: ID!
		): [Message!]
		messageList: [Room!]
	}

 	extend type Subscription {
		newMessage: Message
	}
	 
`
export default typedef