'use strict'

const Promise = require('bluebird')
Promise.longStackTraces()
const colors = require('colors')

const config = require('./config/config')
const environment = config.get('environment')
const appName = config.get('app') + '@' + environment + ' v' + config.get('version')

// Event listening
const emitter = require('rheactor-server/services/emitter')
emitter.on('error', (err) => {
  // TODO: Log
  if (/EntityNotFoundError/.test(err.name) || /EntryAlreadyExistsError/.test(err.name)) {
    return
  }
  if (environment !== 'testing') {
    console.error('An error has been emitted:', err)
  }
})
if (environment === 'development') {
  emitter.verbose()
}

if (environment === 'production') {
  process.on('uncaughtException', function (err) {
    console.error('UNCAUGHT EXCEPTION - keeping process alive:', err)
  })
}

// Persistence
const RedisConnection = require('rheactor-server/services/redis-connection')
const redisConfig = config.get('redis')
const redis = new RedisConnection(redisConfig.host, redisConfig.port, redisConfig.database, redisConfig.password)
redis.connect().then((client) => {
  client.on('error', function (err) {
    console.error(err)
  })
})
const repositories = require('./services/repositories')(redis.client)
const Search = require('./services/search')
const search = new Search(repositories, redis.client, emitter)

// Generate RSA keys for JWT
Promise
  .join(
    redis.client.getAsync(environment + ':id_rsa'),
    redis.client.getAsync(environment + ':id_rsa.pub')
  )
  .spread((privateKey, publicKey) => {
    if (privateKey && publicKey) {
      config.set('private_key', privateKey)
      config.set('public_key', publicKey)
      if (environment === 'production') {
        console.log('RSA key pair loaded')
        console.log(config.get('public_key'))
      }
    } else {
      let keypair = require('keypair')
      let pair = keypair({bits: 1024})
      config.set('private_key', pair.private)
      config.set('public_key', pair.public)
      if (environment === 'production') {
        console.log('RSA key pair generated')
        console.log(config.get('public_key'))
      }
      return Promise.join(
        redis.client.setAsync(environment + ':id_rsa', pair.private),
        redis.client.setAsync(environment + ':id_rsa.pub', pair.public)
      )
    }
  })

// TemplateMailer
const TemplateMailerClient = require('template-mailer-aws-lambda-client')
let templateMailer
if ((environment === 'production' || config.get('force_mails')) && !config.get('disable_mails')) {
  console.log(colors.yellow('   ^                                 ^'))
  console.log(colors.yellow('  / \\                               / \\'))
  console.log(colors.yellow(' / ! \\  WARNING! Emails enabled …  / ! \\'))
  console.log(colors.yellow('/_____\\                           /_____\\'))
  templateMailer = new TemplateMailerClient(config.get('template_mailer:endpoint'), config.get('template_mailer:api_key'))
} else {
  // Create a mock mailer
  templateMailer = {
    send: (cfg, template, to, name, data) => {
      if (environment !== 'testing') {
        console.log('TemplateMailer:Dummy', template, '->', name, '<' + to + '>')
      }
      return Promise.resolve()
    }
  }
}

// Event handling
require('rheactor-server/config/command-handler')(repositories, emitter, config, templateMailer)
require('rheactor-server/config/event-handler')(repositories, emitter, config)
require('./config/command-handler')(repositories, emitter, config, templateMailer)
require('./config/event-handler')(repositories, emitter, config, templateMailer)

// Password strength
if (environment !== 'production') {
  config.set('bcrypt_rounds', 1)
}

module.exports = {
  repositories,
  search,
  config,
  emitter,
  redis,
  appName
}
