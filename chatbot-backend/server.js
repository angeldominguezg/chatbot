'use strict'
const debug = require('debug')('chatbot:backend:setup')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const db = require('chatbot-database')
const chalk = require('chalk')
const apiai = require('apiai')

// Dialog flow token
// TODO: token to PROCESS.ENV
// const bot = apiai('3ecf27d468814f7c9a0201191c26de01')
// const configApiAi = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {language: "en"})
const configApiAi = apiai('3ecf27d468814f7c9a0201191c26de01', {language: 'en'})

// setup database config
const dbConfig = {
  database: process.env.DB_NAME || 'chatbotdb',
  username: process.env.DB_USER || 'chatbot',
  password: process.env.DB_PASS || 'chatbot',
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_ENGINE || 'postgres',
  logging: s => debug(s),
  // if setup: true clean the database
  setup: true
}

let Conversation, Message
// --------------------

app.get('/', function (req, res) {
  res.status(200).send('<h1>Chatbot on!</h1>')
})

server.listen(3000, async () => {
  // start database service
  const service = await db(dbConfig).catch(handleFatalError)
  Conversation = service.Conversation
  Message = service.Message
  // --
  console.log(`${chalk.green('[chatbot-backend]')} Server socket is running...`)
})

// middleware for token
io.use((socket, next) => {
  let token = socket.handshake.query.token
  console.log('token:', token)
  return next()

  // if (isValid(token)) {
  //   return next();
  // }
  // return next(new Error('authentication error'))
})

io.sockets.on('connection', function (socket) {
  var date = Date.now()
  console.log(`${chalk.blue('[chatbot-backend]')}'Client Joined:', ${date}`)

  // Event disconnect
  socket.on('disconnect', function () {
    console.log(`${chalk.yellow('[chatbot-backend]')}'Client disconect!'`)
  })

  // socket for set_user
  socket.on('set_user', function (data) {
    console.log('User:', data.username, data.token)
    // socket.join(data.user);

    // - find if this user have conversation in the database
    // - databse query with token

    // if dont have conversation with this token, create one
    io.sockets.emit('set_user_emit', {
      user: data,
      token: Date.now()
    })
  })

  socket.on('subscribe', function (room) {
    console.log('joining room', room)
    socket.join(room)
  })

  // socket to emit message
  socket.on('new_message', function (data) {
    console.log(`${chalk.green('[message incoming]')}`, data)
    // console.log(`${chalk.red('[TEST]')} ${dialogFlow.test()}`)

    io.sockets.emit('messageEmit', {
      message: data.message,
      user: data.username
    })

    // bot response
    var request = configApiAi.textRequest(data.message, {
      sessionId: data.username
    })

    request.on('response', function (response) {
      console.log(`${chalk.bgGreen('[message respose]')}`, response)
      // console.log('Response: ', response.result.fulfillment.speech)
      let sender = data.username
      // Que responde esta funcion

      // Envio el mensaje
      io.sockets.emit('messageEmit', {
        message: response.result.fulfillment.speech,
        user: 'The Weather Guru'
      })
    })

    request.on('error', function (error) {
      console.log(error)
    })
    request.end()
  })

  socket.on('send private message', function (data) {
    console.log('sending room post', data.token)
    socket.broadcast.to(data.token).emit('privateMessage', {
      username: data.username,
      message: data.message
    })
  })
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error:]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
// --------------------------------------------
