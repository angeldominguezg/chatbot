'use strict'

module.exports = function setupConversation(ConversationModel) {
  function findById(id) {
    return ConversationModel.findById(id)
  }
  return {
    findById
  }
}