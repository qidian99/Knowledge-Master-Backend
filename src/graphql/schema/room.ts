const { gql } = require('apollo-server-express');

const typedef = gql`
	type Room {
		roomId: ID!
		chatterOne: UserType!
		chatterTwo: UserType!
		message: Message
	}
`

export default typedef