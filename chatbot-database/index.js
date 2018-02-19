'use strict'
const setupDatabase = require('./lib/db')
const setupConversationModel = require('./models/conversation')
const setupMessageModel = require('./models/message')
const setupConversation = require('./lib/conversation')
const defaults = require('defaults')

module.exports = async function (config) {
  // Sqlite for testing
  config = defaults(config, {
    dialect: 'sqlite',
    pools: {
      max: 10,
      min: 0,
      idle: 0
    },
    query: {
      raw: true
    }
  })
  // ------------------
  const sequelize = setupDatabase(config)
  const ConversationModel = setupConversationModel(config)
  const MessageModel = setupMessageModel(config)

  ConversationModel.hasMany(MessageModel)
  MessageModel.belongsTo(ConversationModel)

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const Conversation = setupConversation(ConversationModel)
  const Message = {}

  return {
    Conversation,
    Message
  }
}

// Api ai --------------------------------------------
// var apiai = require('apiai')
// var app = apiai('3ecf27d468814f7c9a0201191c26de01')

// // var request = app.textRequest('<Your text query>', {
// //   sessionId: '<unique session id>'
// // })

// var request = app.textRequest('ok', {
//   sessionId: '001'
// })

// // Dialog Flow response
// request.on('response', function (response) {
//   console.log('API.AI: ', response)
// })

// // Dialog flow error
// request.on('error', function (error) {
//   console.log(error)
// })

// request.end()

// end Api ai -------------------------------------
