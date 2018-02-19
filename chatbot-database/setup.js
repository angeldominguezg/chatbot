'use strict'

const debug = require('debug')('chatbot:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  const answer = await prompt([{
    type: 'confirm',
    name: 'setup',
    message: 'This will destroy you dtabase, are you sure?'
  }])

  if (!answer.setup) {
    return console.log('Nothing happened ;)')
  }

  const config = {
    database: process.env.DB_NAME || 'chatbotdb',
    username: process.env.DB_USER || 'chatbot',
    password: process.env.DB_PASS || 'chatbot',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_ENGINE || 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)
  // if all ok
  console.log('Success!')
  process.exit(0)
}

// if any error
function handleFatalError (err) {
  console.error(`${chalk.red('[-- Error --]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
