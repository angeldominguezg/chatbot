'use strict'

const conversation = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  username: 'Angel',
  conversation_session: 'aaaaaalllllsss',
  createdAt: new Date(),
  updatedAt: new Date()
}

// agent array to populate results for listing, search...
const conversations = [
  conversation,
  extend(conversation, {id: 2, uuid: 'yyy-yyy-yyw', username: 'Peter', conversation_session: 'aaasss'}),
  extend(conversation, {id: 3, uuid: 'yyy-yyy-yyx', username: 'Luis', conversation_session: 'ssswww'}),
  extend(conversation, {id: 4, uuid: 'yyy-yyy-yyz', username: 'Frank', conversation_session: 'eeeerrrr'})
]

// extends clone the obj replace the values
function extend(obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

// export
module.exports = {
  single: conversation,
  all: conversations,
  byUserName: usename => conversations.filter(a => a.username === usename), // return by username
  byUuid: id => conversations.filter(a => a.uuid === id).shift(), // retorna por uuid
  byId: id => conversations.filter(a => a.id === id).shift() // retorna por id
}
