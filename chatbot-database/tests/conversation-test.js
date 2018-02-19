'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const conversationFixtures = require('./fixtures/conversation')

let config = {
  logging: function () { }
}

let MessageStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, conversationFixtures.single)
let id = 1
let ConversationStub = null
let db = null
let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  ConversationStub = {
    hasMany: sandbox.spy()
  }

  // Model FindById stub
  ConversationStub.findById = sandbox.stub()
  ConversationStub.findById.withArgs(id).returns(Promise.resolve(conversationFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/conversation': () => ConversationStub,
    './models/message': () => MessageStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Conversation', t => {
  t.truthy(db.Conversation, 'Conversation service should exist')
})

test.serial('Setup', t => {
  t.true(ConversationStub.hasMany.called, 'ConversationModel.hasMany was executed')
  t.true(ConversationStub.hasMany.calledWith(MessageStub), 'Argument should be the MessageModel')
  t.true(MessageStub.belongsTo.called, 'MessageModel.belongsTo was executed')
  t.true(MessageStub.belongsTo.calledWith(ConversationStub), 'Message should be the ConversationModel')
})

// test case
test.serial('Conversation#findByID', async t => {
  let conversation = await db.Conversation.findById(id)
  t.true(ConversationStub.findById.called, 'findById should be called on model')
  t.true(ConversationStub.findById.calledOnce, 'findById should be called once')
  t.true(ConversationStub.findById.calledWith(id), 'findById should be called with specified id')
  t.deepEqual(conversation, conversationFixtures.byId(id), 'Should be the same.')
})
