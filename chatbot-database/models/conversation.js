'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupConversationModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('conversation', {
    uuid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'No Username'
    },
    conversation_session: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })
}
