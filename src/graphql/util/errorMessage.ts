// for user
const USER_CONTEXT_ERR: [string, string] = ["Invalid user in context", '101']



// for post
const POST_FIND_ERR: [string, string] = ["Post does not exist", '501']
const LIKE_A_POST_ERR: [string, string] = ["Failed to Like a post", '502']

// for message
const CHATTER_ONE_RESOLVE_ERR: [string, string] = ["Chatter one find err", '800']
const CHATTER_TWO_RESOLVE_ERR: [string, string] = ["Chatter two find err", '801']
const ROOM_CREATION_ERR: [string, string] = ["Room creation err", '802']
const MSG_CREATION_ERR: [string, string] = ["Message creation err", '803']


export default {
  USER_CONTEXT_ERR,
  POST_FIND_ERR,
  LIKE_A_POST_ERR,
  CHATTER_ONE_RESOLVE_ERR,
  CHATTER_TWO_RESOLVE_ERR,
  ROOM_CREATION_ERR,
  MSG_CREATION_ERR
}
